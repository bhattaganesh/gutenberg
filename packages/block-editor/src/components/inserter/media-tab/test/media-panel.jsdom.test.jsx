import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaCategoryPanel } from '../media-panel';

globalThis.wpVitest.mockMatchMedia();

// Keep the panel's data + async surface out of the test: return a small,
// non-empty result set so the grid (and the detach affordance) render. The
// mock is a spy so tests can assert on the query the panel sends.
const { useMediaResults } = vi.hoisted( () => ( {
	useMediaResults: vi.fn( () => ( {
		mediaList: [
			{ id: 1, title: 'Example', url: 'https://example.com/1' },
		],
		isLoading: false,
	} ) ),
} ) );
vi.mock( import( '../hooks' ), () => ( {
	useMediaResults,
	useDelayedLoading: () => false,
} ) );

// Replace the redesigned grid with a marker that reports the actions it was
// given and lets tests drive its search and paging callbacks.
vi.mock( import( '../media-grid' ), () => ( {
	__esModule: true,
	default: ( { actions, onChangeSearch, onChangePage, page, footer } ) => (
		<div
			data-testid="media-grid"
			data-actions={ actions.map( ( action ) => action.id ).join( ',' ) }
			data-page={ page }
		>
			<button onClick={ () => onChangeSearch( 'sunset' ) }>search</button>
			<button onClick={ () => onChangePage( 2 ) }>next page</button>
			{ footer }
		</div>
	),
} ) );

// Replace `MediaList` with a marker that only reports whether it was wired for
// detach, so the gate can be asserted without the full preview/dropdown tree.
vi.mock( import( '../media-list' ), () => ( {
	__esModule: true,
	default: ( { onDetach } ) => (
		<div
			data-testid="media-list"
			data-has-detach={ String( !! onDetach ) }
		/>
	),
} ) );

// The attach button renders through MediaUpload's render prop behind a
// capability check; stub both so the real Button (and its label) render.
vi.mock( import( '../../../media-upload' ), () => ( {
	__esModule: true,
	default: ( { render: renderProp } ) => renderProp( { open: () => {} } ),
} ) );
vi.mock( import( '../../../media-upload/check' ), () => ( {
	__esModule: true,
	default: ( { children } ) => children,
} ) );

const baseCategory = {
	name: 'attached-images',
	labels: { name: 'Attached images', search_items: 'Search attachments' },
	mediaType: 'image',
	fetch: vi.fn(),
	attach: vi.fn(),
	detach: vi.fn(),
	invalidate: vi.fn(),
};

function renderPanel( category ) {
	return render(
		<MediaCategoryPanel
			rootClientId=""
			onInsert={ vi.fn() }
			category={ category }
		/>
	);
}

describe( 'MediaCategoryPanel attach/detach gating', () => {
	it( 'exposes attach/detach for the built-in Attachments source', () => {
		renderPanel( baseCategory );

		expect(
			screen.getByRole( 'button', { name: 'Attach images' } )
		).toBeInTheDocument();
		expect( screen.getByTestId( 'media-list' ) ).toHaveAttribute(
			'data-has-detach',
			'true'
		);
	} );

	it( 'ignores attach/detach when the source is an external resource', () => {
		// Every category registered by an extender through the public
		// `registerInserterMediaCategory` API is forced to `isExternalResource:
		// true`, so an extender-registered source cannot opt into the workflow
		// even if it sets `attach`/`detach`.
		renderPanel( { ...baseCategory, isExternalResource: true } );

		expect(
			screen.queryByRole( 'button', { name: 'Attach images' } )
		).not.toBeInTheDocument();
		expect( screen.getByTestId( 'media-list' ) ).toHaveAttribute(
			'data-has-detach',
			'false'
		);
	} );
} );

describe( 'MediaCategoryPanel subscription gating', () => {
	it( 'subscribes a local source to media changes and unsubscribes on unmount', () => {
		const unsubscribe = vi.fn();
		const subscribe = vi.fn( () => unsubscribe );

		const { unmount } = renderPanel( { ...baseCategory, subscribe } );

		// The panel hands its own query over, so the source can watch the exact
		// results the grid is showing.
		expect( subscribe ).toHaveBeenCalledTimes( 1 );
		expect( subscribe ).toHaveBeenCalledWith(
			expect.any( Function ),
			expect.objectContaining( { per_page: expect.any( Number ) } )
		);
		expect( unsubscribe ).not.toHaveBeenCalled();

		unmount();

		expect( unsubscribe ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'ignores subscribe when the source is an external resource', () => {
		// `subscribe` is core-only, gated like `attach`/`detach`: an
		// extender-registered source is always external, so it cannot hook into
		// the panel's refresh cycle just by setting the prop.
		const subscribe = vi.fn();

		renderPanel( { ...baseCategory, subscribe, isExternalResource: true } );

		expect( subscribe ).not.toHaveBeenCalled();
	} );
} );

describe( 'MediaCategoryPanel with the media inserter redesign', () => {
	beforeEach( () => {
		window.__experimentalMediaInserter = true;
		useMediaResults.mockClear();
	} );
	afterEach( () => {
		delete window.__experimentalMediaInserter;
	} );

	const lastQuery = () => useMediaResults.mock.lastCall[ 1 ];

	it( 'renders the grid with a detach action and the attach button for the Attachments source', () => {
		renderPanel( baseCategory );

		expect( screen.getByTestId( 'media-grid' ) ).toHaveAttribute(
			'data-actions',
			'detach'
		);
		expect(
			screen.getByRole( 'button', { name: 'Attach images' } )
		).toBeInTheDocument();
	} );

	it( 'offers a report action instead of detach for an external source', () => {
		renderPanel( {
			...baseCategory,
			isExternalResource: true,
			getReportUrl: () => 'https://example.com/report',
		} );

		expect( screen.getByTestId( 'media-grid' ) ).toHaveAttribute(
			'data-actions',
			'report'
		);
		expect(
			screen.queryByRole( 'button', { name: 'Attach images' } )
		).not.toBeInTheDocument();
	} );

	it( 'queries with the search term and page the grid reports', async () => {
		const user = userEvent.setup();
		renderPanel( baseCategory );

		expect( lastQuery() ).toEqual(
			expect.objectContaining( { page: 1, search: '' } )
		);

		await user.click( screen.getByRole( 'button', { name: 'next page' } ) );
		expect( lastQuery() ).toEqual( expect.objectContaining( { page: 2 } ) );
		expect( screen.getByTestId( 'media-grid' ) ).toHaveAttribute(
			'data-page',
			'2'
		);

		// A new search restarts from the first page.
		await user.click( screen.getByRole( 'button', { name: 'search' } ) );
		expect( lastQuery() ).toEqual(
			expect.objectContaining( { page: 1, search: 'sunset' } )
		);
	} );
} );
