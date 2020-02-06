<?php

namespace Sandstorm\NeosAcl\Service;

/*
 * This file is part of the Neos.ACLInspector package.
 */

use Doctrine\DBAL\Connection;
use Neos\ContentRepository\Domain\Model\Workspace;
use Neos\ContentRepository\Domain\Repository\WorkspaceRepository;
use Neos\ContentRepository\Domain\Service\ContentDimensionPresetSourceInterface;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\ActionRequest;
use Neos\Flow\Mvc\Routing\UriBuilder;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Flow\Security\Authorization\Privilege\PrivilegeInterface;
use Neos\Flow\Security\Authorization\PrivilegeManagerInterface;
use Neos\Flow\Security\Context;
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

    /**
     * @Flow\Inject
     * @var Context
     */
    protected $securityContext;

    /**
     * @Flow\Inject
     * @var ResourceManager
     */
    protected $resourceManager;


    /**
     * @Flow\Inject
     * @var WorkspaceRepository
     */
    protected $workspaceRepository;

    /**
     * @Flow\Inject
     * @var ContentDimensionPresetSourceInterface
     */
    protected $contentDimensionPresetSource;

    /**
     * @Flow\Inject
     * @var ContextFactoryInterface
     */
    protected $contextFactory;


    public function generatePropsForReactWidget(ActionRequest $actionRequest): string
    {
        $props = [
            'nodeTypes' => $this->generateNodeTypeNames(),
            'nodeSearchEndpoint' => $this->generateNodeSearchEndpoint($actionRequest),
            'siteNode' => $this->getSiteNodeContextPath(),


            'csrfProtectionToken' => $this->securityContext->getCsrfProtectionToken(),
            'cssFilePath' => $this->resourceManager->getPublicPackageResourceUriByPath('resource://Sandstorm.NeosAcl/Public/React/extra-neos-wrapper.css'),
            'workspaces' => $this->getWorkspaces(),
            'dimensions' => $this->getDimensionPresets()
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

    protected function getWorkspaces()
    {
        $result = [];
        foreach ($this->workspaceRepository->findAll() as $workspace) {
            /* @var $workspace \Neos\ContentRepository\Domain\Model\Workspace */

            if (!$workspace->isPersonalWorkspace()) {
                $result[] = [
                    'name' => $workspace->getName(),
                    'label' => $workspace->getTitle()
                ];
            }
        }

        return $result;
    }

    protected function getDimensionPresets()
    {
        $result = [];

        foreach ($this->contentDimensionPresetSource->getAllPresets() as $dimensionName => $dimensionConfig) {
            foreach ($dimensionConfig['presets'] as $presetName => $presetConfig) {
                $result[] = [
                    'contentDimensionAndPreset' => $dimensionName . '|||' . $presetName,
                    'dimensionLabel' => $dimensionConfig['label'],
                    'presetLabel' => $presetConfig['label'],
                ];
            }
        }
        return $result;
    }

    public function getSiteNodeContextPath(): string
    {
        $context = $this->contextFactory->create([
            'workspaceName' => 'live'
        ]);

        return $context->getCurrentSiteNode()->getContextPath();
    }
}
