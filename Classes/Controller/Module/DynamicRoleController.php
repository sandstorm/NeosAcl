<?php
namespace Sandstorm\NeosAcl\Controller\Module;

/*
 * This file is part of the Sandstorm.NeosAcl package.
 */

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\Controller\ActionController;
use Neos\Flow\Property\TypeConverter\ArrayConverter;
use Sandstorm\NeosAcl\Domain\Model\DynamicRole;
use Sandstorm\NeosAcl\Service\DynamicRoleEditorService;

class DynamicRoleController extends ActionController
{

    /**
     * @Flow\Inject
     * @var \Sandstorm\NeosAcl\Domain\Repository\DynamicRoleRepository
     */
    protected $dynamicRoleRepository;

    /**
     * @Flow\Inject
     * @var DynamicRoleEditorService
     */
    protected $dynamicRoleEditorService;

    /**
     * @return void
     */
    public function indexAction()
    {
        $this->view->assign('dynamicRoles', $this->dynamicRoleRepository->findAll());
    }

    /**
     * @param \Sandstorm\NeosAcl\Domain\Model\DynamicRole $dynamicRole
     * @return void
     */
    public function showAction(DynamicRole $dynamicRole)
    {
        $this->view->assign('dynamicRole', $dynamicRole);
    }

    /**
     * @return void
     */
    public function newAction()
    {
        $this->view->assign('dynamicEditorProps', $this->dynamicRoleEditorService->generatePropsForReactWidget($this->request));
    }

    public function initializeCreateAction() {
        $this->arguments->getArgument('newDynamicRole')->getPropertyMappingConfiguration()->forProperty('matcher')->setTypeConverterOption(ArrayConverter::class, ArrayConverter::CONFIGURATION_STRING_FORMAT, ArrayConverter::STRING_FORMAT_JSON);
        $this->arguments->getArgument('newDynamicRole')->getPropertyMappingConfiguration()->forProperty('parentRoleNames')->setTypeConverterOption(ArrayConverter::class, ArrayConverter::CONFIGURATION_STRING_FORMAT, ArrayConverter::STRING_FORMAT_JSON);
    }

    /**
     * @param \Sandstorm\NeosAcl\Domain\Model\DynamicRole $newDynamicRole
     * @return void
     */
    public function createAction(DynamicRole $newDynamicRole)
    {
        $this->dynamicRoleRepository->add($newDynamicRole);
        $this->addFlashMessage('Created a new dynamic role.');
        $this->redirect('index');
    }

    /**
     * @param \Sandstorm\NeosAcl\Domain\Model\DynamicRole $dynamicRole
     * @return void
     */
    public function editAction(DynamicRole $dynamicRole)
    {
        $this->view->assign('dynamicRole', $dynamicRole);
        $this->view->assign('dynamicEditorProps', $this->dynamicRoleEditorService->generatePropsForReactWidget($this->request));
    }

    public function initializeUpdateAction() {
        $this->arguments->getArgument('dynamicRole')->getPropertyMappingConfiguration()->forProperty('matcher')->setTypeConverterOption(ArrayConverter::class, ArrayConverter::CONFIGURATION_STRING_FORMAT, ArrayConverter::STRING_FORMAT_JSON);
        $this->arguments->getArgument('dynamicRole')->getPropertyMappingConfiguration()->forProperty('parentRoleNames')->setTypeConverterOption(ArrayConverter::class, ArrayConverter::CONFIGURATION_STRING_FORMAT, ArrayConverter::STRING_FORMAT_JSON);
    }

    /**
     * @param \Sandstorm\NeosAcl\Domain\Model\DynamicRole $dynamicRole
     * @return void
     */
    public function updateAction(DynamicRole $dynamicRole)
    {
        $this->dynamicRoleRepository->update($dynamicRole);
        $this->addFlashMessage('Updated the dynamic role.');
        $this->redirect('index');
    }

    /**
     * @param \Sandstorm\NeosAcl\Domain\Model\DynamicRole $dynamicRole
     * @return void
     */
    public function deleteAction(DynamicRole $dynamicRole)
    {
        $this->dynamicRoleRepository->remove($dynamicRole);
        $this->addFlashMessage('Deleted a dynamic role.');
        $this->redirect('index');
    }
}
