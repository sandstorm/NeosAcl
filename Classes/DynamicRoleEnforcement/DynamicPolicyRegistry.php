<?php

namespace Sandstorm\NeosAcl\DynamicRoleEnforcement;

/*
 * This file is part of the Neos.ACLInspector package.
 */

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Configuration\ConfigurationManager;
use Neos\Flow\ObjectManagement\ObjectManagerInterface;
use Neos\Flow\Security\Authorization\Privilege\PrivilegeInterface;
use Neos\Flow\Security\Authorization\Privilege\PrivilegeTarget;
use Neos\Flow\Security\Policy\PolicyService;
use Neos\Utility\Arrays;

/**
 * See README.md - the section "Implementing Dynamic Node Privileges and MethodPrivileges" for a full explanation
 * what is done here.
 *
 * @Flow\Scope("singleton")
 */
final class DynamicPolicyRegistry
{

    /**
     * The PrivilegeTarget types in this list can be registered dynamically.
     *
     * - the key is the PrivilegeTarget type
     * - the value the name of the "catch-all" PrivilegeTarget
     *
     * If this is changed, `Policy.yaml` must be adjusted correspondingly.
     */
    const ALLOWED_PRIVILEGE_TARGET_TYPES = [
        'Neos\ContentRepository\Security\Authorization\Privilege\Node\EditNodePrivilege' => 'Sandstorm.NeosAcl:EditAllNodes',
        'Neos\ContentRepository\Security\Authorization\Privilege\Node\CreateNodePrivilege' => 'Sandstorm.NeosAcl:CreateAllNodes',
        'Neos\ContentRepository\Security\Authorization\Privilege\Node\RemoveNodePrivilege' => 'Sandstorm.NeosAcl:RemoveAllNodes'
    ];

    /**
     * @Flow\Inject
     * @var ObjectManagerInterface
     */
    protected $objectManager;

    /**
     * key: the privilege target type.
     * value: string[] - a list of dynamically registered PrivilegeTargets for this type.
     * @var array
     */
    protected $dynamicPrivilegeTargetsPerType = [];

    /**
     * are {@see $catchAllToDynamicPrivilegeMapping} and {@see $dynamicPrivilegeToCatchAllMapping} initialized and up to date with
     * {@see $dynamicPrivilegeTargetsPerType}?
     * @var boolean
     */
    protected $privilegeMappingsInitialized = false;

    /**
     * each key represents the "source" privilege target (i.e. the "template Catch All" to-be-copied one); and the value
     * is another array where each element represents a "target" privilegeTarget; where the config from
     * the source should be copied to.
     *
     * Built up in {@see initializeDynamicPrivilegeMapping}.
     *
     * @var array
     */
    protected $catchAllToDynamicPrivilegeMapping;

    /**
     * each key represents "target" privilege target; and each value represents the "source" privilege target (i.e. the "template Catch All" to-be-copied one)
     *
     * This is the reverse of {@see $catchAllToDynamicPrivilegeMapping}.
     *
     * Built up in {@see initializeDynamicPrivilegeMapping}.
     *
     * @var array
     */
    protected $dynamicPrivilegeToCatchAllMapping;

    /**
     * This method should be called inside a custom Slot for {@see PolicyService::emitConfigurationLoaded()}
     *
     * @param array $dynamicPolicy
     * @param array $originalPolicy
     */
    public function registerDynamicPolicyAndMergeThemWithOriginal(array $dynamicPolicy, array &$originalPolicy)
    {
        if (isset($dynamicPolicy['privilegeTargets'])) {
            foreach ($dynamicPolicy['privilegeTargets'] as $privilegeTargetType => $privilegeTargetsForType) {
                self::ensurePrivilegeTargetIsInDynamicWhitelist($privilegeTargetType);
                $this->dynamicPrivilegeTargetsPerType[$privilegeTargetType] = $privilegeTargetsForType;
            }

            // we reset the privilege mappings as they need to be rebuilt if dynamicPrivilegeTargetsPerType changes.
            $this->privilegeMappingsInitialized = false;
        }

        // merge together both policies
        $originalPolicy = Arrays::arrayMergeRecursiveOverrule($originalPolicy, $dynamicPolicy);
    }

    private static function ensurePrivilegeTargetIsInDynamicWhitelist(string $privilegeTargetType)
    {
        if (!isset(self::ALLOWED_PRIVILEGE_TARGET_TYPES[$privilegeTargetType])) {
            throw new \RuntimeException('the privilege target type "' . $privilegeTargetType . '" is not allowed to be registered dynamically.');
        }
    }

    /**
     * The `methodPermissions` is the data structure as stored inside the `Flow_Security_Authorization_Privilege_Method`
     * cache.
     *
     * First level: call-site (Class Name + Method Name)
     * Second level: Privilege->getCacheEntryIdentifier()
     * Third level: (internal structure for MethodPrivilege)
     *
     * @param array $methodPermissions
     * @return mixed
     * @throws \Neos\Flow\Security\Exception
     */
    public function postProcessMethodPermissionList(array $methodPermissions)
    {
        $this->initializeDynamicPrivilegeMapping();

        // now, copy all method permissions.
        foreach ($methodPermissions as &$inner) {
            foreach ($this->catchAllToDynamicPrivilegeMapping as $cacheIdentifierForCatchAllPrivilegeTarget => $extraCacheIdentifiers) {
                if (isset($inner[$cacheIdentifierForCatchAllPrivilegeTarget])) {
                    foreach ($extraCacheIdentifiers as $cacheIdentifier) {
                        $inner[$cacheIdentifier] = $inner[$cacheIdentifierForCatchAllPrivilegeTarget];
                    }
                }
            }
        }

        return $methodPermissions;
    }

    public function getAopRuntimeExpressionEntryIdentifierForCatchAllPrivilegeTarget(string $dynamicPrivilegeTargetCacheEntryIdentifier): ?string
    {
        $this->initializeDynamicPrivilegeMapping();

        // the entry identifier has the format "flow_aop_expression_[cacheEntryIdentifier_of_role]", where
        // [cacheEntryIdentifier_of_role] is the MD5 of role name + some more properties.
        //
        // Thus, we strip the flow_aop_expression_ part; and then try to find the policy cache entry identifier for the catch-all case.
        $cacheIdentifier = str_replace('flow_aop_expression_', '', $dynamicPrivilegeTargetCacheEntryIdentifier);

        if (isset($this->dynamicPrivilegeToCatchAllMapping[$cacheIdentifier])) {
            // Now, we need to again prepend flow_aop_expression_ to; to build a proper cache entry identifier for Flow_Aop_RuntimeExpressions.
            return 'flow_aop_expression_' . $this->dynamicPrivilegeToCatchAllMapping[$cacheIdentifier];
        }

        return null;
    }

    /**
     * This method prepares a mapping between privilege targets to be copied; i.e. it creates an array,
     * where each key represents the "source" privilege target (i.e. the to-be-copied one); and the value
     * is another array where each element represents a "target" privilegeTarget; where the config from
     * the source should be copied to.
     *
     * NOTE: the privilege targets are represented by their `Privilege->getCacheEntryIdentifier()` return values;
     * because that is later needed to update the Flow_Security_Authorization_Privilege_Method cache.
     *
     * @throws \Neos\Flow\Security\Exception
     */
    private function initializeDynamicPrivilegeMapping(): void
    {
        if ($this->privilegeMappingsInitialized === true) {
            return;
        }

        $dynamicPrivilegeMapping = [];
        $dynamicPrivilegeToCatchAllMapping = [];
        foreach ($this->dynamicPrivilegeTargetsPerType as $privilegeTargetType => $dynamicPrivilegeTargets) {
            $catchAllPrivilegeTargetForType = self::ALLOWED_PRIVILEGE_TARGET_TYPES[$privilegeTargetType];
            $matcherForCatchAllPrivilegeTarget = static::getMatcherForCatchAllPrivilegeTargets($this->objectManager)[$catchAllPrivilegeTargetForType];

            $cacheIdentifierForCatchAllPrivilegeTarget = (new PrivilegeTarget($catchAllPrivilegeTargetForType, $privilegeTargetType, $matcherForCatchAllPrivilegeTarget, []))
                ->createPrivilege(PrivilegeInterface::GRANT, [])
                ->getCacheEntryIdentifier();

            // Intermediate representation: build up the cache identifier for each dynamic privilege target
            $extraCacheIdentifiers = [];
            foreach ($dynamicPrivilegeTargets as $dynamicPrivilegeTargetIdentifier => $dynamicPrivilegeTargetConfiguration) {
                $cacheIdentifier = (new PrivilegeTarget($dynamicPrivilegeTargetIdentifier, $privilegeTargetType, $dynamicPrivilegeTargetConfiguration['matcher'], []))->createPrivilege(PrivilegeInterface::GRANT, [])->getCacheEntryIdentifier();
                $extraCacheIdentifiers[] = $cacheIdentifier;
                $dynamicPrivilegeToCatchAllMapping[$cacheIdentifier] = $cacheIdentifierForCatchAllPrivilegeTarget;
            }

            $dynamicPrivilegeMapping[$cacheIdentifierForCatchAllPrivilegeTarget] = $extraCacheIdentifiers;
        }

        $this->catchAllToDynamicPrivilegeMapping = $dynamicPrivilegeMapping;
        $this->dynamicPrivilegeToCatchAllMapping = $dynamicPrivilegeToCatchAllMapping;
        $this->privilegeMappingsInitialized = true;
    }


    /**
     * @param ObjectManagerInterface $objectManager
     * @return array the key is a Privilege class name; the value is "true" if privileges are configured for this class name.
     * @Flow\CompileStatic
     */
    public static function getMatcherForCatchAllPrivilegeTargets($objectManager): array
    {
        $catchAllPrivilegeTargetMatchers = [];

        $configurationManager = $objectManager->get(ConfigurationManager::class);
        $policyConfiguration = $configurationManager->getConfiguration(ConfigurationManager::CONFIGURATION_TYPE_POLICY);
        foreach (self::ALLOWED_PRIVILEGE_TARGET_TYPES as $catchAllPrivilegeTargetType => $catchAllPrivilegeTargetName) {
            $catchAllPrivilegeTargetMatchers[$catchAllPrivilegeTargetName] = $policyConfiguration['privilegeTargets'][$catchAllPrivilegeTargetType][$catchAllPrivilegeTargetName]['matcher'];
        }

        return $catchAllPrivilegeTargetMatchers;
    }
}
