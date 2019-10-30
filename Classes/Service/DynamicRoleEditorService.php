<?php

namespace Sandstorm\NeosAcl\Service;

/*
 * This file is part of the Neos.ACLInspector package.
 */

use Doctrine\DBAL\Connection;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\ActionRequest;
use Neos\Flow\Mvc\Routing\UriBuilder;
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
class DynamicRoleEditorService
{

    /**
     * @Flow\Inject
     * @var NodeTypeManager
     */
    protected $nodeTypeManager;


    public function generatePropsForReactWidget(ActionRequest $actionRequest): string
    {
        $props = [
            'nodeTypes' => $this->generateNodeTypeNames(),
            'nodeSearchEndpoint' => $this->generateNodeSearchEndpoint($actionRequest)
        ];

        return json_encode($props);
    }

    private function generateNodeTypeNames()
    {
        $nodeTypes = [];
        /* @var $nodeType \Neos\ContentRepository\Domain\Model\NodeType */
        foreach ($this->nodeTypeManager->getNodeTypes() as $nodeType) {
            $nodeTypes[] = [
                'value' => $nodeType->getName(),
                'label' => $nodeType->getName(),
            ];
        }
        return $nodeTypes;
    }

    private function generateNodeSearchEndpoint(ActionRequest $actionRequest): string
    {
        $uriBuilder = new UriBuilder();
        $uriBuilder->setRequest($actionRequest->getMainRequest());
        return $uriBuilder->setCreateAbsoluteUri(true)->uriFor('index', [], 'Service\Nodes', 'Neos.Neos');
    }
}
