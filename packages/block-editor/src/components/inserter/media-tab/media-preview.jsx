import clsx from 'clsx';
import {
	DropdownMenu,
	MenuGroup,
	MenuItem,
	Spinner,
	Modal,
	Flex,
	FlexItem,
	Button,
	Composite,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useCallback, useState } from '@wordpress/element';
import { moreVertical, external, linkOff } from '@wordpress/icons';
import { Tooltip } from '@wordpress/ui';
import InserterDraggableBlocks from '../../inserter-draggable-blocks';
import { getBlockAndPreviewFromMedia } from './utils';
import { useMediaInsert } from './use-media-insert';

const MEDIA_OPTIONS_POPOVER_PROPS = {
	placement: 'bottom-end',
	className:
		'block-editor-inserter__media-list__item-preview-options__popover',
};

function MediaPreviewOptions( { category, media, onDetach } ) {
	if ( ! category.getReportUrl && ! onDetach ) {
		return null;
	}
	const reportUrl = category.getReportUrl?.( media );
	return (
		<DropdownMenu
			className="block-editor-inserter__media-list__item-preview-options"
			label={ __( 'Options' ) }
			popoverProps={ MEDIA_OPTIONS_POPOVER_PROPS }
			icon={ moreVertical }
		>
			{ () => (
				<MenuGroup>
					{ reportUrl && (
						<MenuItem
							onClick={ () =>
								window.open( reportUrl, '_blank' ).focus()
							}
							icon={ external }
						>
							{ sprintf(
								/* translators: %s: The media type to report e.g: "image", "video", "audio" */
								__( 'Report %s' ),
								category.mediaType
							) }
						</MenuItem>
					) }
					{ onDetach && (
						<MenuItem
							onClick={ () => onDetach( media ) }
							icon={ linkOff }
						>
							{ category.postTypeLabel
								? sprintf(
										/* translators: %s: Name of the post type e.g: "Page". */
										__( 'Detach from %s' ),
										category.postTypeLabel
								  )
								: __( 'Detach from post' ) }
						</MenuItem>
					) }
				</MenuGroup>
			) }
		</DropdownMenu>
	);
}

export function InsertExternalImageModal( { onClose, onSubmit } ) {
	return (
		<Modal
			title={ __( 'Insert external image' ) }
			onRequestClose={ onClose }
			className="block-editor-inserter-media-tab-media-preview-inserter-external-image-modal"
		>
			<VStack spacing={ 3 }>
				<p>
					{ __(
						'This image cannot be uploaded to your Media Library, but it can still be inserted as an external image.'
					) }
				</p>
				<p>
					{ __(
						'External images can be removed by the external provider without warning and could even have legal compliance issues related to privacy legislation.'
					) }
				</p>
			</VStack>
			<Flex
				className="block-editor-block-lock-modal__actions"
				justify="flex-end"
				expanded={ false }
			>
				<FlexItem>
					<Button
						__next40pxDefaultSize
						variant="tertiary"
						onClick={ onClose }
					>
						{ __( 'Cancel' ) }
					</Button>
				</FlexItem>
				<FlexItem>
					<Button
						__next40pxDefaultSize
						variant="primary"
						onClick={ onSubmit }
					>
						{ __( 'Insert' ) }
					</Button>
				</FlexItem>
			</Flex>
		</Modal>
	);
}

export function MediaPreview( { media, onClick, onDetach, category } ) {
	const [ isHovered, setIsHovered ] = useState( false );
	const [ block, preview ] = useMemo(
		() => getBlockAndPreviewFromMedia( media, category.mediaType ),
		[ media, category.mediaType ]
	);
	const {
		insert,
		insertingId,
		pendingExternalBlock,
		confirmExternalInsert,
		cancelExternalInsert,
	} = useMediaInsert( onClick );
	// The hook is per item here, so any in-flight upload is this item's.
	const isInserting = insertingId !== undefined;
	const onMediaInsert = useCallback(
		() => insert( block, media.id ?? media.sourceId ),
		[ insert, block, media.id, media.sourceId ]
	);

	const title =
		typeof media.title === 'string'
			? media.title
			: media.title?.rendered || __( 'no title' );

	const onMouseEnter = useCallback( () => setIsHovered( true ), [] );
	const onMouseLeave = useCallback( () => setIsHovered( false ), [] );
	return (
		<>
			<InserterDraggableBlocks isEnabled blocks={ [ block ] }>
				{ ( { draggable, onDragStart, onDragEnd } ) => (
					<div
						className={ clsx(
							'block-editor-inserter__media-list__list-item',
							{
								'is-hovered': isHovered,
							}
						) }
						draggable={ draggable }
						onDragStart={ onDragStart }
						onDragEnd={ onDragEnd }
					>
						{ /* Adding `is-hovered` class to the wrapper element is needed
						because the options Popover is rendered outside of this node. */ }
						<div
							onMouseEnter={ onMouseEnter }
							onMouseLeave={ onMouseLeave }
						>
							<Tooltip.Root>
								<Tooltip.Trigger
									render={
										<Composite.Item
											render={
												<div
													aria-label={ title }
													role="option"
													className="block-editor-inserter__media-list__item"
												/>
											}
											onClick={ onMediaInsert }
										>
											<div className="block-editor-inserter__media-list__item-preview">
												{ preview }
												{ isInserting && (
													<div className="block-editor-inserter__media-list__item-preview-spinner">
														<Spinner />
													</div>
												) }
											</div>
										</Composite.Item>
									}
								/>
								<Tooltip.Popup>{ title }</Tooltip.Popup>
							</Tooltip.Root>
							{ ! isInserting && (
								<MediaPreviewOptions
									category={ category }
									media={ media }
									onDetach={ onDetach }
								/>
							) }
						</div>
					</div>
				) }
			</InserterDraggableBlocks>
			{ pendingExternalBlock && (
				<InsertExternalImageModal
					onClose={ cancelExternalInsert }
					onSubmit={ confirmExternalInsert }
				/>
			) }
		</>
	);
}
