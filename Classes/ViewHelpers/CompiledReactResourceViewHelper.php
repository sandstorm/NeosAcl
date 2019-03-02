<?php

namespace FamilyHome\TnBase\ViewHelpers;

/*                                                                        *
 * This script belongs to the TYPO3 Flow package "FamilyHome.TnPage".            *
 *                                                                        *
 * It is free software; you can redistribute it and/or modify it under    *
 * the terms of the GNU General Public License, either version 3 of the   *
 * License, or (at your option) any later version.                        *
 *                                                                        *
 * The TYPO3 project - inspiring people to share!                         *
 *                                                                        */

use Neos\Eel\FlowQuery\FlowQuery;
use Neos\Flow\Annotations as Flow;
use Neos\Flow\Package\PackageManagerInterface;
use Neos\Flow\ResourceManagement\ResourceManager;
use Neos\FluidAdaptor\Core\ViewHelper\AbstractViewHelper;

class CompiledReactResourceViewHelper extends AbstractViewHelper
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

    /**
     * @param string $fileType
     * @return string
     */
    public function render($fileType = 'js')
    {
        $resourcesPath = $this->packageManager->getPackage('FamilyHome.TnBase')->getResourcesPath();
        $folderToCheck = $resourcesPath . '/Public/nutware-app-build/static/' . $fileType;
        $files = glob($folderToCheck . '/main.*.' . $fileType);
        $fileName = basename($files[0]);

        return $this->resourceManager->getPublicPackageResourceUriByPath('resource://FamilyHome.TnBase/Public/nutware-app-build/static/' . $fileType . '/' . $fileName);
    }

}
