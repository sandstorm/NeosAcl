<?php

namespace Sandstorm\NeosAcl\Performance;

use Neos\Flow\Aop\JoinPointInterface;
use Neos\Flow\Annotations as Flow;

/**
 * the NodePrivilegeContext does not cache the Node references;
 * but instead fetches them again and again (for every node
 * check) from the DB.
 *
 * This is a hotfix, which adds the cache in an aspect.
 *
 * @Flow\Scope("singleton")
 * @Flow\Aspect
 */
class NodeContextPerformanceAspect
{

    protected $nodeCache = [];

    /**
     * @Flow\Around("method(Neos\ContentRepository\Security\Authorization\Privilege\Node\NodePrivilegeContext->getNodeByIdentifier())")
     * @return void
     */
    public function boot(JoinPointInterface $joinPoint)
    {
        $nodeIdentifier = $joinPoint->getMethodArgument('nodeIdentifier');
        if (array_key_exists($nodeIdentifier, $this->nodeCache)) {
            return $this->nodeCache[$nodeIdentifier];
        }

        $result = $joinPoint->getAdviceChain()->proceed($joinPoint);
        $this->nodeCache[$nodeIdentifier] = $result;
        return $result;
    }
}
