import { afterEach, expect, test } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ToolsPanel } from '../';
import { ContextSystemProvider } from '../../context';

afterEach( cleanup );

test( 'ToolsPanel preserves its spacing against Grid context values', () => {
	render(
		<ContextSystemProvider
			value={ { Grid: { columnGap: '40px', rowGap: '48px' } } }
		>
			<ToolsPanel
				label="Panel header"
				resetAll={ () => {} }
				data-testid="tools-panel"
			>
				<span>Panel content</span>
			</ToolsPanel>
		</ContextSystemProvider>
	);

	expect( screen.getByTestId( 'tools-panel' ) ).toHaveStyle( {
		columnGap: '16px',
		rowGap: '16px',
	} );
} );
