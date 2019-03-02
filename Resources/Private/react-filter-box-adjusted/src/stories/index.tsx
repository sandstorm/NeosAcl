import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import PermissionWidget from '../PermissionWidget';

storiesOf('Button', module)
  .add('with text', () => <PermissionWidget />);
