<?php

namespace Sandstorm\NeosAcl\Cache;

use Neos\ContentRepository\Security\Authorization\Privilege\Node\EditNodePrivilege;
use Neos\Flow\Annotations as Flow;
use Neos\Cache\Frontend\FrontendInterface;
use Neos\Cache\Frontend\VariableFrontend;
use Neos\Flow\Security\Authorization\Privilege\Method\MethodPrivilege;
use Neos\Flow\Security\Authorization\Privilege\PrivilegeInterface;
use Neos\Flow\Security\Authorization\Privilege\PrivilegeTarget;
use Neos\Flow\Security\Policy\PolicyService;

class SecurityAuthorizationPrivilegeMethodCacheFrontend extends VariableFrontend
{

    /**
     * @Flow\Inject
     * @var PolicyService
     */
    protected $policyService;

    public function get(string $entryIdentifier)
    {
        $result = parent::get($entryIdentifier);
        if (!$this->policyService) {
            // TODO: short cut for bootstrap - compile time run.
            return $result;
        }
        if ($entryIdentifier === 'methodPermission' && $result) {
            return $this->postProcessMethodPermissionList($result);
        }
    }

    protected function postProcessMethodPermissionList($result)
    {
        // NO PARAMETERS enough here.
        $sourceCacheEntryIdentifier = (new PrivilegeTarget('Sandstorm.NeosAcl:EditAllNodes', EditNodePrivilege::class, 'true', []))->createPrivilege(PrivilegeInterface::GRANT, [])->getCacheEntryIdentifier();
        $targetCacheEntryIdentifier = (new PrivilegeTarget('Foo:Bar', EditNodePrivilege::class, 'true', []))->createPrivilege(PrivilegeInterface::GRANT, [])->getCacheEntryIdentifier();


        foreach ($result as $methodIdentifier => &$inner) {
            if (isset($inner[$sourceCacheEntryIdentifier])) {
                $inner[$targetCacheEntryIdentifier] = $inner[$sourceCacheEntryIdentifier];
            }
        }

        return $result;
    }
}
