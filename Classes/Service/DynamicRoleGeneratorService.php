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
use Sandstorm\NeosAcl\Dto\ACLCheckerDto;

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


    public function modifyConfiguration(&$configuration)
    {

        $connection = $this->entityManager->getConnection();
        $rows = $connection->executeQuery('SELECT name, abstract, parentrolenames FROM sandstorm_neosacl_domain_model_dynamicrole')->fetchAll();
        foreach ($rows as $row) {
            $configuration['roles']['Dynamic:' . $row['name']] = [
                'abstract' => intval($row['abstract']) === 1,
                'parentRoles' => json_decode($row['parentrolenames'], true),
                'privileges' => [
                    [
                        'privilegeTarget' => 'Dynamic:' . $row['name'],
                        'permission' => 'GRANT'
                    ]
                ]
            ];

            $configuration['privilegeTargets']['Neos\ContentRepository\Security\Authorization\Privilege\Node\EditNodePrivilege']['Dynamic:' . $row['name']] = [
                'matcher' => 'isDescendantNodeOf("' . 'a3474e1d-dd60-4a84-82b1-18d2f21891a3' . '")'
            ];
        }
        //var_dump($configuration);
    }
}
