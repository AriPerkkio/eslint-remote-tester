import React from 'react';
import { render } from 'ink';

import config from '@config';
import AppCI from './components/AppCI';
import AppCLI from './components/AppCLI';

export default function renderApplication(): void {
    render(config.CI ? <AppCI /> : <AppCLI />, {
        // CLIs will exit by useScroll hook, CIs by default
        exitOnCtrlC: config.CI,
    });
}
