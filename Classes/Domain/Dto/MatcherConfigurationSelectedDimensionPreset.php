<?php

namespace Sandstorm\NeosAcl\Domain\Dto;

/*
 * This file is part of the Neos.ACLInspector package.
 */

use Neos\Flow\Annotations as Flow;

/**
 * The matcher looks as follows:
 *
 * {
 *     "dimensionName": "foo",
 *     "presetName": "foo"
 *   }
 *
 * @param array $matcher
 * @return string
 * @Flow\Proxy(false)
 */
class MatcherConfigurationSelectedDimensionPreset
{

    /**
     * @var string
     */
    private $dimensionName;

    /**
     * @var string
     */
    private $presetName;

    /**
     * MatcherConfigurationSelectedDimensionPreset constructor.
     * @param string $dimensionName
     * @param string $presetName
     */
    private function __construct(string $dimensionName, string $presetName)
    {
        $this->dimensionName = $dimensionName;
        $this->presetName = $presetName;
    }

    public static function fromConfig(array $config): self
    {
        return new self(
            $config['dimensionName'],
            $config['presetName']
        );
    }

    public function __toString()
    {
        return sprintf('%s: %s', $this->dimensionName, $this->presetName);
    }

    public function toPolicyMatcherString(): string
    {
        return sprintf('isInDimensionPreset("%s", "%s")', $this->dimensionName, $this->presetName);
    }
}
