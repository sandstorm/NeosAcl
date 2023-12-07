<?php

namespace Sandstorm\NeosAcl\Service;

/*
 * This file is part of the Neos.ACLInspector package.
 */

use Doctrine\DBAL\Connection;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Security\Authorization\Privilege\PrivilegeInterface;
use Neos\Flow\Security\Authorization\PrivilegeManagerInterface;
use Neos\Flow\Security\Exception\NoSuchRoleException;
use Neos\Flow\Security\Policy\PolicyService;
use Neos\Flow\Security\Policy\Role;
use Neos\Neos\Domain\Repository\SiteRepository;
use Neos\Neos\Security\Authorization\Privilege\NodeTreePrivilege;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\ContentRepository\Domain\Model\NodeLabelGeneratorInterface;
use Neos\ContentRepository\Domain\Service\ContextFactoryInterface;
use Neos\ContentRepository\Security\Authorization\Privilege\Node\AbstractNodePrivilege;
use Neos\ContentRepository\Security\Authorization\Privilege\Node\CreateNodePrivilege;
use Neos\ContentRepository\Security\Authorization\Privilege\Node\CreateNodePrivilegeSubject;
use Neos\ContentRepository\Security\Authorization\Privilege\Node\EditNodePrivilege;
use Neos\ContentRepository\Security\Authorization\Privilege\Node\NodePrivilegeSubject;
use Neos\ContentRepository\Security\Authorization\Privilege\Node\ReadNodePrivilege;
use Neos\ContentRepository\Security\Authorization\Privilege\Node\RemoveNodePrivilege;
use Sandstorm\NeosAcl\Domain\Dto\MatcherConfiguration;
use Sandstorm\NeosAcl\Domain\Model\DynamicRole;
use Sandstorm\NeosAcl\Dto\ACLCheckerDto;
use Sandstorm\NeosAcl\DynamicRoleEnforcement\DynamicPolicyRegistry;

/**
 * @Flow\Scope("singleton")
 */
class DynamicRoleGeneratorService
{

    /**
     * @Flow\Inject
     * @var \Doctrine\ORM\EntityManagerInterface
     */
    protected $entityManager;

    /**
     * @Flow\Inject(lazy=false)
     * @var DynamicPolicyRegistry
     */
    protected $dynamicPolicyRegistry;

    public function onConfigurationLoaded(&$configuration)
    {
        // NOTE: this hook seems to be only triggered in runtime; not in compiletime (which is great for us!)

        $customConfiguration = [];
        $connection = $this->entityManager->getConnection();
        $rows = $connection->executeQuery('SELECT name, abstract, parentrolenames, matcher, privilege FROM sandstorm_neosacl_domain_model_dynamicrole')->fetchAll();
        foreach ($rows as $row) {
            $parentRoles = json_decode($row['parentrolenames'], true);
            $matcherConfig = json_decode($row['matcher'], true);
            $privileges = [];

            if (in_array('Sandstorm.NeosAcl:NodeTreeRestricted', $parentRoles) && ($row['privilege'] === DynamicRole::PRIVILEGE_VIEW || $row['privilege'] === DynamicRole::PRIVILEGE_VIEW_EDIT || $row['privilege'] === DynamicRole::PRIVILEGE_VIEW_EDIT_CREATE_DELETE)) {
                $customConfiguration['privilegeTargets']['Neos\Neos\Security\Authorization\Privilege\ReadNodeTreePrivilege']['Dynamic:' . $row['name'] . '.ReadNodeTree'] = [
                    'matcher' => MatcherConfiguration::fromJson($matcherConfig)->toPolicyMatcherStringForAncestorNodesAndChildren(),
                ];

                $privileges[] = [
                    'privilegeTarget' => 'Dynamic:' . $row['name'] . '.ReadNodeTree',
                    'permission' => 'GRANT'
                ];
            }

            $matcher = MatcherConfiguration::fromJson($matcherConfig)->toPolicyMatcherString();
            if ($row['privilege'] === DynamicRole::PRIVILEGE_VIEW_EDIT || $row['privilege'] === DynamicRole::PRIVILEGE_VIEW_EDIT_CREATE_DELETE) {
                $customConfiguration['privilegeTargets']['Neos\ContentRepository\Security\Authorization\Privilege\Node\EditNodePrivilege']['Dynamic:' . $row['name'] . '.EditNode'] = [
                    'matcher' => $matcher
                ];

                $privileges[] = [
                    'privilegeTarget' => 'Dynamic:' . $row['name'] . '.EditNode',
                    'permission' => 'GRANT'
                ];
            }

            if ($row['privilege'] === DynamicRole::PRIVILEGE_VIEW_EDIT_CREATE_DELETE) {
                $customConfiguration['privilegeTargets']['Neos\ContentRepository\Security\Authorization\Privilege\Node\CreateNodePrivilege']['Dynamic:' . $row['name'] . '.CreateNode'] = [
                    'matcher' => $matcher
                ];
                $customConfiguration['privilegeTargets']['Neos\ContentRepository\Security\Authorization\Privilege\Node\RemoveNodePrivilege']['Dynamic:' . $row['name'] . '.RemoveNode'] = [
                    'matcher' => $matcher
                ];

                $privileges[] = [
                    'privilegeTarget' => 'Dynamic:' . $row['name'] . '.CreateNode',
                    'permission' => 'GRANT'
                ];
                $privileges[] = [
                    'privilegeTarget' => 'Dynamic:' . $row['name'] . '.RemoveNode',
                    'permission' => 'GRANT'
                ];
            }

            $customConfiguration['roles']['Dynamic:' . $row['name']] = [
                'abstract' => intval($row['abstract']) === 1,
                'parentRoles' => $parentRoles,
                'privileges' => $privileges
            ];
        }

        $this->dynamicPolicyRegistry->registerDynamicPolicyAndMergeThemWithOriginal($customConfiguration, $configuration);
    }
}
