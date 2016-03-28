/**
 * Created by tagdiv on 24.03.2016.
 */

/* global jQuery:{} */
/* global Backbone:{} */
/* global _:{} */

/* global tdcAdminWrapperUI:{} */
/* global tdcMaskUI:{} */
/* global tdcRowUI:{} */
/* global tdcColumnUI:{} */
/* global tdcInnerRowUI:{} */
/* global tdcInnerColumnUI:{} */
/* global tdcElementUI:{} */

var tdcOperationUI;

(function(jQuery, backbone, _, undefined) {

    'use strict';

    tdcOperationUI = {

        iframeContents: undefined,

        // The 'tdc-element', 'tdc-inner-column', 'tdc-element-inner-row', 'tdc-column' or 'tdc-row'  being dragged
        _draggedElement: undefined,

        // The 'tdc-element', 'tdc-inner-column', 'tdc-element-inner-row', 'tdc-column' or 'tdc-row' where the 'draggedElement' is over
        _currentElementOver: undefined,

        _emptyElementClass: 'tdc-element-empty',




        init: function( iframeContents ) {

            window.previousMouseClientX = 0;
            window.previousMouseClientY = 0;

            tdcOperationUI.iframeContents = iframeContents;



            tdcRowUI.init();
            tdcColumnUI.init();
            tdcInnerRowUI.init();
            tdcInnerColumnUI.init();
            tdcElementUI.init();


            tdcAdminWrapperUI.$mask = jQuery('<div id="' + tdcAdminWrapperUI.maskId + '"></div>');
            tdcOperationUI.iframeContents.find('body').append( tdcAdminWrapperUI.$mask );
            tdcMaskUI.init( tdcAdminWrapperUI.$mask );



            jQuery( window ).mouseup(function( event ) {
                //tdcDebug.log( 'window mouse up' );

                tdcOperationUI.deactiveDraggedElement();
                tdcOperationUI.hideHelper();

            }).mousemove(function( event ) {
                //tdcDebug.log( 'window mouse move' );

                tdcOperationUI.showHelper( event );
            });



            iframeContents.mousedown(function(event) {
                //tdcDebug.log( 'contents mouse down' );

            }).mouseup(function(event) {
                //tdcDebug.log( 'contents mouse up' );

                tdcOperationUI.deactiveDraggedElement();
                tdcOperationUI.hideHelper();

                tdcOperationUI.setCurrentElementOver( undefined );
                tdcElementUI.positionElementPlaceholder( event );

                // Hide the mask
                tdcMaskUI.setCurrentElement( undefined );

            }).mousemove(function(event) {
                //tdcDebug.log( 'contents mouse move' );

                tdcOperationUI.showHelper( event );

                window.previousMouseClientX = event.clientX;
                window.previousMouseClientY = event.clientY;

            }).scroll(function( event ) {
                //tdcDebug.log( '------------- content scroll -------------' );

                if ( tdcOperationUI.isElementDragged() ) {
                    tdcElementUI.positionElementPlaceholder( event );
                } else if ( tdcOperationUI.isInnerColumnDragged() ) {
                    tdcInnerColumnUI.positionInnerColumnPlaceholder( event );
                } else if ( tdcOperationUI.isInnerRowDragged() ) {
                    tdcInnerRowUI.positionInnerRowPlaceholder( event );
                } else if ( tdcOperationUI.isColumnDragged() ) {
                    tdcColumnUI.positionColumnPlaceholder( event );
                } else if ( tdcOperationUI.isRowDragged() ) {
                    tdcRowUI.positionRowPlaceholder( event);
                }
            });




            tdcAdminWrapperUI._tdcJqObjHelper.mouseup(function( event ) {
                //tdcDebug.log( 'helper mouse up' );

                tdcOperationUI.hideHelper();
            });

            window.test = function() {
                tdcDebug.log( 1 );
            };
        },




        setDraggedElement: function( draggedElement ) {
            tdcOperationUI._draggedElement = draggedElement;
        },


        getDraggedElement: function() {
            return tdcOperationUI._draggedElement;
        },




        setCurrentElementOver: function( currentElementOver ) {
            tdcOperationUI._currentElementOver = currentElementOver;
        },


        getCurrentElementOver: function() {
            return tdcOperationUI._currentElementOver;
        },




        activeDraggedElement: function( currentElement ) {
            tdcOperationUI.setDraggedElement( currentElement );

            if ( ! tdcOperationUI._draggedElement.hasClass( 'tdc-dragged' ) ) {
                tdcOperationUI._draggedElement.css({
                    opacity: 0.5
                });
                tdcOperationUI._draggedElement.addClass( 'tdc-dragged' );
                //tdcDebug.log( 'ACTIVATE' );
                //tdcDebug.log( draggedElement );
            }
        },


        deactiveDraggedElement: function() {

            var draggedElement = tdcOperationUI.getDraggedElement();

            if ( ! _.isUndefined( draggedElement ) ) {
                draggedElement.css({
                    opacity: ''
                });
                draggedElement.removeClass( 'tdc-dragged' );

                tdcOperationUI._moveDraggedElement();

                //tdcDebug.log( 'DEACTIVATE' );
                //tdcDebug.log( draggedElement );

                tdcOperationUI.setDraggedElement( undefined );
            } else {
                //tdcDebug.log( 'dragged UNDEFINED' );
            }
        },




        showHelper: function( mouseEvent ) {
            var $helper = tdcAdminWrapperUI._tdcJqObjHelper;

            var draggedElement = tdcOperationUI.getDraggedElement();

            if ( ! _.isUndefined( draggedElement ) ) {
                $helper.css({
                    left: mouseEvent.clientX - 50,
                    top: mouseEvent.clientY - 50
                });
                $helper.show();

                if ( draggedElement.hasClass( 'tdc-row' ) ) {
                    $helper.html( 'ROW' );
                } else if ( draggedElement.hasClass( 'tdc-column' ) ) {
                    $helper.html( 'COLUMN' );
                } else if ( draggedElement.hasClass( 'tdc-element-inner-row' ) ) {
                    $helper.html( 'INNER ROW' );
                } else if ( draggedElement.hasClass( 'tdc-inner-column' ) ) {
                    $helper.html( 'INNER COLUMN' );
                } else if ( draggedElement.hasClass( 'tdc-element' ) ) {
                    $helper.html( 'ELEMENT' );
                } else {
                    $helper.html( '' );
                }
            } else {
                tdcOperationUI.hideHelper();
            }
        },


        hideHelper: function() {
            tdcAdminWrapperUI._tdcJqObjHelper.hide();
        },




        isRowDragged: function() {
            var draggedElement = tdcOperationUI.getDraggedElement();

            return !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc-row' );
        },


        /**
         * Check the dragged element is a column.
         * If the optional $siblingColumn parameter is used, it also checks to see if the sent column is sibling with the dragged element
         *
         * @param $siblingColumn - optional - jQuery column object under the mouse pointer
         * @returns {boolean|*}
         */
        isColumnDragged: function( $siblingColumn ) {

            var draggedElement = tdcOperationUI.getDraggedElement(),
                result = !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc-column' );

            if ( ! _.isUndefined( $siblingColumn ) ) {
                result = result && ( $siblingColumn.closest( '.tdc-columns').find( '.tdc-column.tdc-dragged' ).length > 0 );
            }
            return result;
        },


        isInnerRowDragged: function() {
            var draggedElement = tdcOperationUI.getDraggedElement();

            return !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc-element-inner-row' );
        },


        isInnerColumnDragged: function( $siblingInnerColumn ) {
            var draggedElement = tdcOperationUI.getDraggedElement(),
                result = !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc-inner-column' );

            if ( ! _.isUndefined( $siblingInnerColumn ) ) {
                result = result && ( $siblingInnerColumn.closest( '.tdc-inner-columns').find( '.tdc-inner-column.tdc-dragged' ).length > 0 );
            }
            return result;
        },


        isElementDragged: function() {
            var draggedElement = tdcOperationUI.getDraggedElement();

            return !_.isUndefined( draggedElement ) && draggedElement.hasClass( 'tdc-element' );
        },




        _setPlaceholder: function( classes, props ) {

            var $placeholder = tdcAdminWrapperUI._tdcJqObjPlaceholder;

            if ( _.isArray( classes ) ) {
                _.each( classes, function( element, index, list) {
                    $placeholder.addClass( element );
                });
            } else if ( _.isString( classes ) ) {
                $placeholder.addClass( classes );
            } else {
                $placeholder.attr( 'class', '' );
            }

            if ( _.isObject( props ) ) {
                $placeholder.css( props );
            }
        },


        setHorizontalPlaceholder: function() {
            tdcOperationUI._setPlaceholder( null, {
                'top': '',
                'left': '',
                'bottom': '',
                'margin-left': '',
                'position': ''
            });
        },


        setVerticalPlaceholder: function( props ) {
            tdcOperationUI._setPlaceholder( ['vertical'], props);
        },




        _moveDraggedElement: function() {
            var $draggedElement = tdcOperationUI.getDraggedElement(),
                $currentElementOver = tdcOperationUI.getCurrentElementOver(),
                $placeholder = tdcAdminWrapperUI._tdcJqObjPlaceholder,

                $tdcInnerColumnParentOfDraggedElement,
                $tdcColumnParentOfDraggedElement;

            if ( ! _.isUndefined( $draggedElement ) && ! _.isUndefined( $currentElementOver ) && ! _.isUndefined( $placeholder ) ) {

                var $emptyElement,
                    $tdcElements = $draggedElement.closest( '.tdc-elements');

                // An empty element is added to the remaining '.tdc-elements' list, to allow drag&drop operations over it
                // At drop, any empty element is removed from the target list
                if ( 1 === $tdcElements.children().length ) {

                    // Add the 'tdc-element-column' or the 'tdc-element-inner-column' class to the empty element
                    var structureClass = '';

                    $tdcInnerColumnParentOfDraggedElement = $draggedElement.closest( '.tdc-inner-column' );
                    if ( $tdcInnerColumnParentOfDraggedElement.length ) {
                        structureClass = ' tdc-element-inner-column';
                    } else {
                        $tdcColumnParentOfDraggedElement = $draggedElement.closest( '.tdc-column' );
                        if ( $tdcColumnParentOfDraggedElement.length ) {
                            structureClass = ' tdc-element-column';
                        }
                    }
                    $emptyElement = jQuery( '<div class="' + tdcOperationUI._emptyElementClass + structureClass + '"></div>' );

                    tdcElementUI.defineOperationsForEmptyElement( $emptyElement );

                    $tdcElements.append( $emptyElement );
                }

                $placeholder.replaceWith( $draggedElement );



                // Update the 'tdc-element-inner-column' or the 'tdc-element-column' of the dragged element (AFTER IT HAS BEEN MOVED TO THE DROP POSITION)

                $tdcInnerColumnParentOfDraggedElement = $draggedElement.closest( '.tdc-inner-column' );
                if ( $tdcInnerColumnParentOfDraggedElement.length ) {
                    $draggedElement.removeClass( 'tdc-element-column' );
                    $draggedElement.addClass( 'tdc-element-inner-column' );
                } else {
                    $tdcColumnParentOfDraggedElement = $draggedElement.closest( '.tdc-column' );
                    if ( $tdcColumnParentOfDraggedElement.length ) {
                        $draggedElement.removeClass( 'tdc-element-inner-column' );
                        $draggedElement.addClass( 'tdc-element-column' );
                    }
                }



                // Remove the empty element if exists (after the dragged element has been dragged)

                var $prevDraggedElement = $draggedElement.prev();
                if ( $prevDraggedElement.hasClass( tdcOperationUI._emptyElementClass ) ) {
                    $prevDraggedElement.remove();
                    return;
                }

                var $nextDraggedElement = $draggedElement.next();
                if ( $nextDraggedElement.hasClass( tdcOperationUI._emptyElementClass ) ) {
                    $nextDraggedElement.remove();
                }
            }
        }
    };

})(jQuery, Backbone, _);