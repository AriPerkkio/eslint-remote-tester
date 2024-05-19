import React from 'react';
import { render } from 'ink';

import config from '../config/index.js';
import AppCI from './components/AppCI.js';
import AppCLI from './components/AppCLI.js';

export default function renderApplication(): void {
    // Both stdout and stdin need to be TTY in order to get scrollbox working
    const isTTY = !!(process.stdout.isTTY && process.stdin.isTTY);

    render(config.CI ? <AppCI /> : <AppCLI isTTY={isTTY} />, {
        // CLIs will exit by useScroll hook, CIs by default
        exitOnCtrlC: config.CI || !isTTY,
    });
}
