<?php
namespace Sandstorm\NeosAcl\Dto;

use Neos\Flow\Annotations as Flow;

class ACLCheckerDto
{

    /**
     * @var string
     */
    protected $startOnNodePath;

    /**
     * @var string
     */
    protected $stopOnNodePath;

    /**
     * @var integer
     * @Flow\InjectConfiguration(path="userInterface.navigateComponent.nodeTree.loadingDepth", package="TYPO3.Neos")
     */
    protected $nodeTreeLoadingDepth;

    /**
     * @var array
     */
    protected $roles = ['TYPO3.Neos:Editor', 'TYPO3.Neos:Administrator'];

    /**
     * @return array
     */
    public function getRoles()
    {
        return $this->roles;
    }

    /**
     * @param array $roles
     */
    public function setRoles($roles)
    {
        $this->roles = $roles;
    }

    /**
     * @return string
     */
    public function getStartOnNodePath()
    {
        return $this->startOnNodePath;
    }

    /**
     * @param string $startOnNodePath
     */
    public function setStartOnNodePath($startOnNodePath)
    {
        $this->startOnNodePath = $startOnNodePath;
    }

    /**
     * @return string
     */
    public function getStopOnNodePath()
    {
        return $this->stopOnNodePath;
    }

    /**
     * @param string $stopOnNodePath
     */
    public function setStopOnNodePath($stopOnNodePath)
    {
        $this->stopOnNodePath = $stopOnNodePath;
    }

    /**
     * @return int
     */
    public function getNodeTreeLoadingDepth()
    {
        return $this->nodeTreeLoadingDepth;
    }

    /**
     * @param int $nodeTreeLoadingDepth
     */
    public function setNodeTreeLoadingDepth($nodeTreeLoadingDepth)
    {
        $this->nodeTreeLoadingDepth = $nodeTreeLoadingDepth;
    }


}
