<?php

namespace Sandstorm\NeosAcl\Service;

/*
 * This file is part of the Neos.ACLInspector package.
 */

use Neos\ContentRepository\Domain\Repository\WorkspaceRepository;
use Neos\ContentRepository\Domain\Service\ContentDimensionPresetSourceInterface;
use Neos\ContentRepository\Domain\Service\NodeTypeManager;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\ActionRequest;
use Neos\Flow\Mvc\Routing\UriBuilder;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\Flow\Security\Context;
use Neos\ContentRepository\Domain\Model\NodeInterface;
use Neos\ContentRepository\Domain\Service\ContextFactoryInterface;
use Sandstorm\NeosAcl\Domain\Dto\MatcherConfiguration;

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

    /**
     * @Flow\InjectConfiguration(path="userInterface.navigateComponent.nodeTree.loadingDepth", package="Neos.Neos")
     * @var string
     */
    protected $nodeTreeLoadingDepth;


    public function generatePropsForReactWidget(ActionRequest $actionRequest, ?MatcherConfiguration $dynamicRoleMatcherConfiguration): string
    {
        $props = [
            'nodeTypes' => $this->generateNodeTypeNames(),
            'nodeSearchEndpoint' => $this->generateNodeSearchEndpoint($actionRequest),
            'siteNode' => $this->getSiteNode()->getContextPath(),
            'nodeTreeLoadingDepth' => (int)$this->nodeTreeLoadingDepth,

            'csrfProtectionToken' => $this->securityContext->getCsrfProtectionToken(),
            'cssFilePath' => $this->resourceManager->getPublicPackageResourceUriByPath('resource://Sandstorm.NeosAcl/Public/React/extra-neos-wrapper.css'),
            'workspaces' => $this->getWorkspaces(),
            'dimensions' => $this->getDimensionPresets(),
            'expandedNodes' => $dynamicRoleMatcherConfiguration ? $this->generateExpandedNodeIdentifiers($dynamicRoleMatcherConfiguration, $this->getSiteNode()) : [],
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
                'isDocumentNode' => $nodeType->isOfType('Neos.Neos:Document')
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
                    'dimensionName' => $dimensionName,
                    'presetName' => $presetName,
                    'dimensionLabel' => $dimensionConfig['label'],
                    'presetLabel' => $presetConfig['label'],
                ];
            }
        }
        return $result;
    }

    public function getSiteNode(): NodeInterface
    {
        $context = $this->contextFactory->create([
            'workspaceName' => 'live'
        ]);

        return $context->getCurrentSiteNode();
    }

    private function generateExpandedNodeIdentifiers(MatcherConfiguration $dynamicRoleMatcherConfiguration, NodeInterface $siteNode)
    {
        $nodeContextPaths = [];

        foreach ($dynamicRoleMatcherConfiguration->getSelectedNodeIdentifiers() as $nodeIdentifier) {
            $node = $this->getSiteNode()->getContext()->getNodeByIdentifier($nodeIdentifier);
            if ($node && $node->getParent() && $node !== $siteNode) {
                // the node itself does not need to be expanded, but all parents should be expanded (so that the node which has the restriction is visible in the tree)
                while ($node->getParent() !== $siteNode) {
                    $node = $node->getParent();
                    $nodeContextPaths[$node->getContextPath()] = $node->getContextPath();
                }
            }
        }

        return array_values($nodeContextPaths);
    }
}
