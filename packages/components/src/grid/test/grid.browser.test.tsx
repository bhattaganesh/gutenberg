import { afterEach, describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { createRef } from '@wordpress/element';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { View } from '../../view';
import { Grid } from '..';

afterEach( cleanup );

describe( 'props', () => {
	test( 'should render correctly', () => {
		render(
			<Grid style={ { width: 300, height: 300 } } data-testid="grid">
				<View />
				<View />
			</Grid>
		);

		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			display: 'grid',
			gridTemplateColumns: '144px 144px',
			gap: '12px',
		} );
	} );

	test( 'should render gap', () => {
		render(
			<Grid
				style={ { width: 332, height: 300 } }
				columns={ 3 }
				gap={ 4 }
				data-testid="grid"
			>
				<View />
				<View />
				<View />
			</Grid>
		);

		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			display: 'grid',
			gridTemplateColumns: '100px 100px 100px',
			gap: '16px',
		} );
	} );

	test( 'should render custom columns', () => {
		render(
			<Grid
				style={ { width: 352, height: 300 } }
				columns={ 7 }
				data-testid="grid"
			>
				<View />
				<View />
				<View />
			</Grid>
		);

		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			display: 'grid',
			gridTemplateColumns: '40px 40px 40px 40px 40px 40px 40px',
		} );
	} );

	test( 'should render custom rows', () => {
		render(
			<Grid
				style={ { width: 300, height: 352 } }
				rows={ 7 }
				data-testid="grid"
			>
				<View />
				<View />
				<View />
			</Grid>
		);

		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			display: 'grid',
			gridTemplateRows: '40px 40px 40px 40px 40px 40px 40px',
		} );
	} );

	test( 'should render align', () => {
		render(
			<Grid
				style={ { width: 300, height: 300 } }
				align="flex-start"
				data-testid="grid"
			>
				<View />
				<View />
				<View />
			</Grid>
		);

		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			alignItems: 'flex-start',
			display: 'grid',
		} );
	} );

	test( 'should render alignment spaced', () => {
		render(
			<Grid
				style={ { width: 300, height: 300 } }
				alignment="spaced"
				data-testid="grid"
			>
				<View />
				<View />
				<View />
			</Grid>
		);

		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			display: 'grid',
			alignItems: 'center',
			justifyContent: 'space-between',
		} );
	} );

	test( 'should render justify', () => {
		render(
			<Grid
				style={ { width: 300, height: 300 } }
				justify="flex-start"
				data-testid="grid"
			>
				<View />
				<View />
				<View />
			</Grid>
		);

		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			display: 'grid',
			justifyContent: 'flex-start',
		} );
	} );

	test( 'should render isInline', () => {
		render(
			<Grid
				style={ { width: 300, height: 300 } }
				columns={ 3 }
				isInline
				data-testid="grid"
			>
				<View />
				<View />
				<View />
			</Grid>
		);

		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			display: 'inline-grid',
			gridTemplateColumns: '92px 92px 92px',
		} );
	} );

	test( 'should render custom templateColumns', () => {
		render(
			<Grid
				style={ { width: 300, height: 300 } }
				templateColumns="1fr auto 1fr"
				data-testid="grid"
			>
				<View />
				<View />
				<View />
			</Grid>
		);

		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			display: 'grid',
			gridTemplateColumns: '138px 0px 138px',
		} );
	} );

	test( 'should render custom templateRows', () => {
		render(
			<Grid
				style={ { width: 300, height: 300 } }
				templateRows="1fr auto 1fr"
				data-testid="grid"
			>
				<View />
				<View />
				<View />
			</Grid>
		);

		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			display: 'grid',
			gridTemplateRows: '138px 0px 138px',
		} );
	} );
} );

describe( 'style composition', () => {
	test.each( [
		[ undefined, undefined, '20px', '20px' ],
		[ 0, '2em', '0px', '28px' ],
		[ '10%', 7, '10%', '7px' ],
		[ '', '', '20px', '20px' ],
	] )(
		'rowGap %s and columnGap %s override the shared gap',
		( rowGap, columnGap, expectedRowGap, expectedColumnGap ) => {
			render(
				<Grid
					data-testid="grid"
					gap={ 5 }
					rowGap={ rowGap }
					columnGap={ columnGap }
					style={ { fontSize: 14 } }
				>
					<View />
				</Grid>
			);
			expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
				rowGap: expectedRowGap,
				columnGap: expectedColumnGap,
			} );
		}
	);

	test( 'alignment takes precedence over align and justify', () => {
		render(
			<Grid
				data-testid="grid"
				alignment="spaced"
				align="end"
				justify="end"
			>
				<View />
			</Grid>
		);
		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			alignItems: 'center',
			justifyContent: 'space-between',
		} );
	} );

	test( 'nested Grids use their own layout props', () => {
		render(
			<Grid
				columns={ 1 }
				rows={ 2 }
				rowGap={ 40 }
				columnGap={ 50 }
				align="end"
				justify="end"
			>
				<Grid data-testid="grid" style={ { width: 300 } }>
					<View />
					<View />
				</Grid>
			</Grid>
		);
		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			gridTemplateColumns: '144px 144px',
			rowGap: '12px',
			columnGap: '12px',
			alignItems: 'normal',
			justifyContent: 'normal',
		} );
	} );

	test( 'zero columns and rows leave track generation to CSS', () => {
		render(
			<Grid data-testid="grid" columns={ 0 } rows={ 0 } gap={ 0 }>
				{ null }
			</Grid>
		);
		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			gridTemplateColumns: 'none',
			gridTemplateRows: 'none',
			gap: '0px',
		} );
	} );

	test( 'inline styles override layout props', () => {
		render(
			<Grid
				data-testid="grid"
				align="end"
				gap={ 5 }
				columns={ 3 }
				style={ {
					display: 'flex',
					gap: 9,
					alignItems: 'start',
					gridTemplateColumns: '50px',
				} }
			>
				<View />
			</Grid>
		);
		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			display: 'flex',
			gap: '9px',
			alignItems: 'start',
			gridTemplateColumns: '50px',
		} );
	} );

	test( 'consumer stylesheets can override layout props', () => {
		render(
			<>
				<style>{ `.grid-consumer.grid-consumer { gap: 23px; align-items: end; grid-template-columns: 100px 100px; }` }</style>
				<Grid
					data-testid="grid"
					className="grid-consumer"
					align="start"
					columns={ 3 }
				>
					<View />
				</Grid>
			</>
		);
		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			gap: '23px',
			alignItems: 'end',
			gridTemplateColumns: '100px 100px',
		} );
	} );

	test( 'CSS-wide values apply to the layout properties', () => {
		render(
			<div
				style={ {
					display: 'grid',
					alignItems: 'end',
					justifyContent: 'end',
					rowGap: 27,
					columnGap: 29,
					gridTemplateColumns: '300px',
					gridTemplateRows: '100px',
				} }
			>
				<Grid
					data-testid="grid"
					align="inherit"
					justify="inherit"
					rowGap="inherit"
					columnGap="inherit"
					templateColumns="inherit"
					templateRows="inherit"
				>
					<View />
				</Grid>
			</div>
		);
		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			alignItems: 'end',
			justifyContent: 'end',
			rowGap: '27px',
			columnGap: '29px',
			gridTemplateColumns: '300px',
			gridTemplateRows: '100px',
		} );
	} );

	test( 'CSS-wide gap resets override the shared gap', () => {
		render(
			<Grid
				data-testid="grid"
				gap={ 5 }
				rowGap="initial"
				columnGap="initial"
			>
				<View />
			</Grid>
		);
		expect( screen.getByTestId( 'grid' ) ).toHaveStyle( {
			rowGap: 'normal',
			columnGap: 'normal',
		} );
	} );

	test( 'responsive tracks follow the existing viewport breakpoints', async () => {
		render(
			<Grid
				data-testid="grid"
				columns={ [ 1, 2, 3, 4 ] }
				rows={ [ 1, 2, 3, 4 ] }
				style={ { width: 300, height: 300 } }
			>
				<View />
			</Grid>
		);
		for ( const [ width, tracks ] of [
			[ 600, 1 ],
			[ 700, 2 ],
			[ 900, 3 ],
			[ 1100, 4 ],
		] ) {
			await page.viewport( width, 800 );
			await expect
				.poll(
					() =>
						getComputedStyle(
							screen.getByTestId( 'grid' )
						).gridTemplateColumns.split( ' ' ).length
				)
				.toBe( tracks );
			expect(
				getComputedStyle(
					screen.getByTestId( 'grid' )
				).gridTemplateRows.split( ' ' )
			).toHaveLength( tracks );
		}
	} );

	test( 'forwards the element type, ref, and consumer props', () => {
		const ref = createRef< HTMLAnchorElement >();
		render(
			<Grid as="a" ref={ ref } href="#target" className="consumer-class">
				Grid link
			</Grid>
		);
		expect( ref.current ).toBe(
			screen.getByRole( 'link', { name: 'Grid link' } )
		);
		expect( ref.current ).toHaveAttribute( 'href', '#target' );
		expect( ref.current ).toHaveClass(
			'components-grid',
			'consumer-class'
		);
	} );
} );
