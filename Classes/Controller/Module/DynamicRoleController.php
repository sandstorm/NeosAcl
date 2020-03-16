<?php
namespace Sandstorm\NeosAcl\Controller\Module;

/*
 * This file is part of the Sandstorm.NeosAcl package.
 */

use Neos\Flow\Annotations as Flow;
use Neos\Flow\Mvc\Controller\ActionController;
use Neos\Flow\Property\TypeConverter\ArrayConverter;
use Neos\Flow\Security\Policy\PolicyService;
use Neos\Flow\Security\Policy\Role;
use Neos\Fusion\Core\Cache\ContentCache;
use Sandstorm\NeosAcl\Domain\Dto\MatcherConfiguration;
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
     * @Flow\Inject
     * @var PolicyService
     */
    protected $policyService;

    /**
     * @Flow\Inject
     * @var ContentCache
     */
    protected $contentCache;

    /**
     * @return void
     */
    public function indexAction()
    {
        $this->view->assign('dynamicRoles', $this->dynamicRoleRepository->findAll());
    }

    /**
     * @return void
     */
    public function newAction()
    {
        $this->view->assign('dynamicEditorProps', $this->dynamicRoleEditorService->generatePropsForReactWidget($this->request, null));
        $templateDynamicRole = new DynamicRole();
        $templateDynamicRole->setAbstract(false);
        $templateDynamicRole->setParentRoleNames(['Neos.Neos:RestrictedEditor', 'Neos.Neos:LivePublisher']);
        $templateDynamicRole->setPrivilege(DynamicRole::PRIVILEGE_VIEW_EDIT_CREATE_DELETE);
        $this->view->assign('dynamicRole', $templateDynamicRole);

        $this->assignAvailableRoles();

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
        $this->flushContentCache();
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
        $this->view->assign('dynamicEditorProps', $this->dynamicRoleEditorService->generatePropsForReactWidget($this->request, MatcherConfiguration::fromJson($dynamicRole->getMatcher())));
        $this->assignAvailableRoles();
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
        $this->flushContentCache();
        $this->addFlashMessage('Updated the dynamic role.');
        $this->redirect('index');
    }

    /**
     * @param \Sandstorm\NeosAcl\Domain\Model\DynamicRole $dynamicRole
     * @return void
     */
    public function removeAction(DynamicRole $dynamicRole)
    {
        $this->dynamicRoleRepository->remove($dynamicRole);
        $this->flushContentCache();
        $this->addFlashMessage('Deleted a dynamic role.');
        $this->redirect('index');
    }

    /**
     * On all write actions, we need to flush the content cache. Otherwise, it might happen that the content cache for
     * the user's workspace still contains ContentEditable markers, but access has been removed in the meantime. This
     * would lead to an exception when the user starts to type; and we want to prevent this.
     */
    protected function flushContentCache()
    {
        $this->contentCache->flush();
    }

    protected function assignAvailableRoles()
    {
        $this->view->assign('availableRoles', array_filter($this->policyService->getRoles(), function(Role $role) {
            return $role->getIdentifier() !== 'Neos.Neos:Editor' && $role->getIdentifier() !== 'Neos.Neos:Administrator' && $role->getIdentifier() !== 'Neos.Neos:SetupUser';
        }));
    }
}
