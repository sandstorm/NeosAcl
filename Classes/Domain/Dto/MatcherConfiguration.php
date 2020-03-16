<?php

namespace Sandstorm\NeosAcl\Domain\Dto;

/*
 * This file is part of the Neos.ACLInspector package.
 */

use Neos\Flow\Annotations as Flow;
use Doctrine\ORM\Mapping as ORM;

/**
 * The matcher looks as follows:
 *
 * {
 *     "selectedWorkspaces": ["live"], // or empty
 *     "dimensionPresets": ["TODO HOW??"],
 *     "selectedNodes": {
 *       "e35d8910-9798-4c30-8759-b3b88d30f8b5": {
 *         "whitelistedNodeTypes": []
 *       },
 *   }
 *
 * @param array $matcher
 * @return string
 * @Flow\Proxy(false)
 */
class MatcherConfiguration
{
    /**
     * @var array
     */
    protected $selectedWorkspaces;

    /**
     * @var array
     */
    protected $selectedDimensionPresets;

    /**
     * @var MatcherConfigurationSelectedNode[]
     */
    protected $selectedNodes;

    /**
     * MatcherConfiguration constructor.
     * @param array $selectedWorkspaces
     * @param MatcherConfigurationSelectedDimensionPreset[] $selectedDimensionPresets
     * @param MatcherConfigurationSelectedNode[] $selectedNodes
     */
    public function __construct(array $selectedWorkspaces, array $selectedDimensionPresets, array $selectedNodes)
    {
        $this->selectedWorkspaces = $selectedWorkspaces;
        $this->selectedDimensionPresets = $selectedDimensionPresets;
        $this->selectedNodes = $selectedNodes;
    }

    public static function fromJson(array $json): self
    {
        $selectedNodes = [];
        foreach ($json['selectedNodes'] as $nodeIdentifier => $config) {
            $selectedNodes[] = MatcherConfigurationSelectedNode::fromConfig($nodeIdentifier, $config);
        }

        $selectedDimensionPresets = [];
        foreach ($json['selectedDimensionPresets']as $config) {
            $selectedDimensionPresets[] = MatcherConfigurationSelectedDimensionPreset::fromConfig($config);
        }


        return new self(
            array_values($json['selectedWorkspaces']),
            $selectedDimensionPresets,
            $selectedNodes
        );
    }

    public function toPolicyMatcherString(): string
    {
        $matcherParts = [];

        $matcherParts[] = self::generatePolicyMatcherStringForSelectedWorkspaces($this->selectedWorkspaces);
        $matcherParts[] = self::generatePolicyMatcherStringForSelectedDimensions($this->selectedDimensionPresets);
        $matcherParts[] = self::generatePolicyMatcherStringForSelectedNodes($this->selectedNodes);

        return implode(' && ', $matcherParts);
    }

    private static function generatePolicyMatcherStringForSelectedWorkspaces(array $selectedWorkspaces): string
    {
        $matcherParts = [];
        foreach ($selectedWorkspaces as $workspace) {
            $matcherParts[] = sprintf('isInWorkspace("%s")', $workspace);
        }
        if (empty($matcherParts)) {
            return 'true';
        }

        return '(' . implode(' || ', $matcherParts) . ')';
    }

    private static function generatePolicyMatcherStringForSelectedDimensions(array $dimensionPresets)
    {
        $matcherParts = [];

        foreach ($dimensionPresets as $dimensionPreset) {
            /* @var $dimensionPreset MatcherConfigurationSelectedDimensionPreset */
            $matcherParts[] = $dimensionPreset->toPolicyMatcherString();
        }

        if (empty($matcherParts)) {
            return 'true';
        }

        return '(' . implode(' || ', $matcherParts) . ')';
    }

    private static function generatePolicyMatcherStringForSelectedNodes(array $selectedNodesConfig)
    {
        $matcherParts = [];

        foreach ($selectedNodesConfig as $nodeConfig) {
            /* @var $nodeConfig \Sandstorm\NeosAcl\Domain\Dto\MatcherConfigurationSelectedNode */
            $matcherParts[] = $nodeConfig->toPolicyMatcherString();
        }

        if (empty($matcherParts)) {
            return 'true';
        }

        return '(' . implode(' || ', $matcherParts) . ')';
    }

    public function renderExplanationParts(): array
    {
        $explanation = [];

        if (count($this->selectedWorkspaces)) {
            $explanation[] = [
                'title' => 'Workspaces',
                'details' => implode(', ', $this->selectedWorkspaces)
            ];
        }

        if (count($this->selectedDimensionPresets)) {
            $explanation[] = [
                'title' => 'Dimensions',
                'details' => implode(', ', $this->selectedDimensionPresets)
            ];
        }

        if (count($this->selectedNodes)) {
            $explanation[] = [
                'title' => count($this->selectedNodes) . ' Nodes',
                'details' => implode(', ', array_map(function (MatcherConfigurationSelectedNode $nodeConfig) {
                    return $nodeConfig->getNodeIdentifier();
                }, $this->selectedNodes))
            ];
        }

        return $explanation;
    }

    /**
     * @return string[]
     */
    public function getSelectedNodeIdentifiers(): array
    {
        $nodeIdentifiers = [];
        foreach ($this->selectedNodes as $selectedNode) {
            $nodeIdentifiers[] = $selectedNode->getNodeIdentifier();
        }

        return $nodeIdentifiers;
    }
}
