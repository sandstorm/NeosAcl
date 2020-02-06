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
 */
class MatcherConfigurationSelectedNode
{
    /**
     * @var string
     */
    protected $nodeIdentifier;

    /**
     * @var array
     */
    protected $whitelistedNodeTypes;

    /**
     * MatcherConfigurationSelectedNode constructor.
     * @param string $nodeIdentifier
     * @param array $whitelistedNodeTypes
     */
    protected function __construct(string $nodeIdentifier, array $whitelistedNodeTypes)
    {
        $this->nodeIdentifier = $nodeIdentifier;
        $this->whitelistedNodeTypes = $whitelistedNodeTypes;
    }

    public static function fromConfig(string $nodeIdentifier, array $config): self
    {
        return new self(
            $nodeIdentifier,
            array_values($config['whitelistedNodeTypes'])
        );
    }

    public function toPolicyMatcherString(): string
    {
        $nodeIdentifierMatcher = sprintf('isDescendantNodeOf("%s")', $this->nodeIdentifier);

        if (empty($this->whitelistedNodeTypes)) {
            return $nodeIdentifierMatcher;
        }

        $nodeTypeMatcher = self::generatePolicyMatcherStringForNodeTypes($this->whitelistedNodeTypes);

        return sprintf('(%s && %s)', $nodeIdentifierMatcher, $nodeTypeMatcher);
    }

    private static function generatePolicyMatcherStringForNodeTypes(array $nodeTypes)
    {
        $matcherParts = [];

        foreach ($nodeTypes as $nodeTypeName) {
            // TODO: maybe also createdNodeIsOfType for the CREATION privilege??
            $matcherParts[] = sprintf('nodeIsOfType("%s")', $nodeTypeName);
        }

        if (empty($matcherParts)) {
            return 'true';
        }

        return '(' . implode(' || ', $matcherParts) . ')';
    }

}
