import clsx from 'clsx';
import { __, isRTL } from '@wordpress/i18n';
import {
	__experimentalItemGroup as ItemGroup,
	__experimentalItem as Item,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalSpacer as Spacer,
	__experimentalHeading as Heading,
	__experimentalView as View,
	Navigator,
	FlexBlock,
} from '@wordpress/components';
import { Icon, chevronRight, chevronLeft } from '@wordpress/icons';

function ScreenHeader( { title } ) {
	return (
		<VStack spacing={ 0 }>
			<View>
				<Spacer marginBottom={ 0 } paddingX={ 4 } paddingY={ 3 }>
					<HStack spacing={ 2 }>
						<Navigator.BackButton
							style={
								// TODO: This style override is also used in ToolsPanelHeader.
								// It should be supported out-of-the-box by Button.
								{ minWidth: 24, padding: 0 }
							}
							icon={ isRTL() ? chevronRight : chevronLeft }
							size="small"
							label={ __( 'Back' ) }
						/>
						<Spacer>
							<Heading level={ 5 }>{ title }</Heading>
						</Spacer>
					</HStack>
				</Spacer>
			</View>
		</VStack>
	);
}

const getDefaultScreenTitle = () => __( 'Back' );

/**
 * A drill-in list of categories: the root screen lists them, and choosing one
 * navigates to a screen rendering that category's content beneath a header
 * with a back button.
 *
 * @param {Object}   props
 * @param {Object[]} props.categories        The categories to list; each needs a `name` and `label`.
 * @param {Function} props.children          Render function receiving the category for its screen.
 * @param {string}   [props.screenClassName] Class name applied to each category screen.
 * @param {string}   [props.className]       Class name applied to the navigator.
 * @param {Function} [props.getScreenTitle]  Returns the header title for a category's screen.
 * @param {Element}  [props.footer]          Content rendered beneath the list on the root screen.
 */
export default function MobileTabNavigation( {
	categories,
	children,
	screenClassName,
	className,
	getScreenTitle = getDefaultScreenTitle,
	footer,
} ) {
	return (
		<Navigator
			initialPath="/"
			className={ clsx(
				'block-editor-inserter__mobile-tab-navigation',
				className
			) }
		>
			<Navigator.Screen
				path="/"
				className="block-editor-inserter__mobile-tab-navigation-root"
			>
				<ItemGroup>
					{ categories.map( ( category ) => (
						<Navigator.Button
							key={ category.name }
							path={ `/category/${ category.name }` }
							as={ Item }
							isAction
						>
							<HStack>
								<FlexBlock>{ category.label }</FlexBlock>
								<Icon
									icon={
										isRTL() ? chevronLeft : chevronRight
									}
								/>
							</HStack>
						</Navigator.Button>
					) ) }
				</ItemGroup>
				{ footer }
			</Navigator.Screen>
			{ categories.map( ( category ) => (
				<Navigator.Screen
					key={ category.name }
					className={ screenClassName }
					path={ `/category/${ category.name }` }
				>
					<ScreenHeader title={ getScreenTitle( category ) } />
					{ children( category ) }
				</Navigator.Screen>
			) ) }
		</Navigator>
	);
}
