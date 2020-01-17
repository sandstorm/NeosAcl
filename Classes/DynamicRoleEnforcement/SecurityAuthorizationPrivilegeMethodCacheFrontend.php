<?php

namespace Sandstorm\NeosAcl\DynamicRoleEnforcement;

use Neos\Flow\Annotations as Flow;
use Neos\Cache\Frontend\VariableFrontend;

/**
 * See README.md - the section "Implementing Dynamic Node Privileges and MethodPrivileges" for a full explanation
 * what is done here.
 */
class SecurityAuthorizationPrivilegeMethodCacheFrontend extends VariableFrontend
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
        if ($entryIdentifier === 'methodPermission' && $result) {
            return $this->dynamicPolicyRegistry->postProcessMethodPermissionList($result);
        }
        return $result;
    }
}
