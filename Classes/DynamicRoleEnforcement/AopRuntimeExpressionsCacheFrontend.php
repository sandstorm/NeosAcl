<?php

namespace Sandstorm\NeosAcl\DynamicRoleEnforcement;

use Neos\Cache\Frontend\StringFrontend;
use Neos\Flow\Annotations as Flow;

/**
 * See README.md - the section "Implementing dynamic AOP Runtime Expressions" for a full explanation
 * what is done here.
 */
class AopRuntimeExpressionsCacheFrontend extends StringFrontend
{

    /**
     * @Flow\Inject
     * @var DynamicPolicyRegistry
     */
    protected $dynamicPolicyRegistry;

    public function get(string $entryIdentifier)
    {
        $result = parent::get($entryIdentifier);
        if (!$this->dynamicPolicyRegistry) {
            // short cut for bootstrap - compile time run.
            return $result;
        }

        if (empty($result)) {
            // in case we did not find anything, we are very likely in a dynamic policy. Thus we check whether the "base policy" has an entry; and return this one instead.
            // This is safe because both have the same attached MethodPrivilege.
            $identifierForCatchAll = $this->dynamicPolicyRegistry->getAopRuntimeExpressionEntryIdentifierForCatchAllPrivilegeTarget($entryIdentifier);
            if (!empty($identifierForCatchAll)) {
                return parent::get($identifierForCatchAll);
            }
        }

        return $result;
    }
}
