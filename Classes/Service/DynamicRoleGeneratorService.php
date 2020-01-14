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
use Sandstorm\NeosAcl\Domain\Model\DynamicRole;
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
        $configuration['privilegeTargets']['Neos\ContentRepository\Security\Authorization\Privilege\Node\EditNodePrivilege']['Foo:Bar'] = [
            'matcher' => 'true'
        ];
        $configuration['roles']['Dynamic:Foo'] = [
            'abstract' => false,
            'parentRoles' => ['Neos.Neos:AbstractEditor'],
            'privileges' => [
                [
                    'privilegeTarget' => 'Foo:Bar',
                    'permission' => 'GRANT'
                ]
            ]
        ];
        return;

        $connection = $this->entityManager->getConnection();
        $rows = $connection->executeQuery('SELECT name, abstract, parentrolenames, matcher, privilege FROM sandstorm_neosacl_domain_model_dynamicrole')->fetchAll();
        foreach ($rows as $row) {

            $matcher = self::buildMatcherString(json_decode($row['matcher'], true));
            $privileges = [];

            if ($row['privilege'] === DynamicRole::PRIVILEGE_VIEW_EDIT || $row['privilege'] === DynamicRole::PRIVILEGE_VIEW_EDIT_CREATE_DELETE) {
                $privileges[] = [
                    'privilegeTarget' => 'Dynamic:' . $row['name'] . '.EditNode',
                    'permission' => 'GRANT'
                ];
            }

            if ($row['privilege'] === DynamicRole::PRIVILEGE_VIEW_EDIT_CREATE_DELETE) {
                $privileges[] = [
                    'privilegeTarget' => 'Dynamic:' . $row['name'] . '.CreateNode',
                    'permission' => 'GRANT'
                ];
                $privileges[] = [
                    'privilegeTarget' => 'Dynamic:' . $row['name'] . '.RemoveNode',
                    'permission' => 'GRANT'
                ];
            }

            $configuration['roles']['Dynamic:' . $row['name']] = [
                'abstract' => intval($row['abstract']) === 1,
                'parentRoles' => json_decode($row['parentrolenames'], true),
                'privileges' => $privileges
            ];

            $configuration['privilegeTargets']['Neos\ContentRepository\Security\Authorization\Privilege\Node\EditNodePrivilege']['Dynamic:' . $row['name'] . '.EditNode'] = [
                'matcher' => $matcher
            ];

            $configuration['privilegeTargets']['Neos\ContentRepository\Security\Authorization\Privilege\Node\CreateNodePrivilege']['Dynamic:' . $row['name'] . '.CreateNode'] = [
                'matcher' => $matcher
            ];

            $configuration['privilegeTargets']['Neos\ContentRepository\Security\Authorization\Privilege\Node\RemoveNodePrivilege']['Dynamic:' . $row['name'] . '.RemoveNode'] = [
                'matcher' => $matcher
            ];
        }
    }

    static private function buildMatcherString(array $matcher): string
    {
        $matcherStringParts = [];
        foreach ($matcher['constraints'] as $constraint) {
            $matcherStringParts[] = sprintf('%s("%s")', $constraint['type'], $constraint['value']);
        }

        return implode(' && ', $matcherStringParts);
    }
}
