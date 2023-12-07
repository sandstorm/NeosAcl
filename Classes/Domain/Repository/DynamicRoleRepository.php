<?php
namespace Sandstorm\NeosAcl\Domain\Repository;
use Neos\Flow\Persistence\QueryInterface;

/*
 * This file is part of the Neos.ACLInspector package.
 */

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Persistence\Doctrine\Repository;

/**
 * @Flow\Scope("singleton")
 */
class DynamicRoleRepository extends Repository
{
    protected $defaultOrderings = ['name' => QueryInterface::ORDER_ASCENDING];
}
