<?php

namespace Sandstorm\NeosAcl\ViewHelpers;
/*                                                                        *
 * This script belongs to the TYPO3 Flow package "FamilyHome.TnPage".            *
 *                                                                        *
 * It is free software; you can redistribute it and/or modify it under    *
 * the terms of the GNU General Public License, either version 3 of the   *
 * License, or (at your option) any later version.                        *
 *                                                                        *
 * The TYPO3 project - inspiring people to share!                         *
 *                                                                        */

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Http\Client\Browser;
use Neos\Flow\Http\Client\CurlEngine;
use Neos\Flow\Http\Uri;
use Neos\Flow\Package\PackageManagerInterface;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\FluidAdaptor\Core\ViewHelper\AbstractViewHelper;

class DevelopmentReactResourceViewHelper extends AbstractViewHelper
{
    /**
     * NOTE: This property has been introduced via code migration to ensure backwards-compatibility.
     * @see AbstractViewHelper::isOutputEscapingEnabled()
     * @var boolean
     */
    protected $escapeOutput = FALSE;
    /**
     * @Flow\Inject
     * @var PackageManagerInterface
     */
    protected $packageManager;
    /**
     * @Flow\Inject
     * @var ResourceManager
     */
    protected $resourceManager;
    const SCRIPT_REGEX = '/<script[^>]*src="([^"]+)"/';

    /**
     * @param string $url
     * @return string
     */
    public function render($url)
    {
        $browser = new Browser();
        $browser->setRequestEngine(new CurlEngine());
        $response = $browser->request(new Uri('http://' . $url));
        $content = $response->getContent();
        $matches = null;
        preg_match_all(self::SCRIPT_REGEX, $content, $matches, PREG_SET_ORDER);
        $output = '';
        foreach ($matches as $match) {
            $output .= '<script src="http://' . $url . $match[1] . '"></script>';
        }
        return $output;
    }
}
