import '@/assets/popup.scss'
import _ from 'lodash'

export default function install( Vue ) {
  var nextKey = 0
  var popupList = []
  var anchorVm = null

  var popupManager = {
    open: function( component, params, options ) {
      if( !component )
        throw new Error( 'component is null' )

      var key = '_popup_key_' + (nextKey++)

      var resolve
      var promise = new Promise( ( rs, rj ) => { resolve = rs } )

      if( !component.back ) {
        if( _.get( options, 'backIgnore' ) ) {
          component.back = function() {
            const lastPopup = _.chain( popupList ).filter( popup => {
              return !_.get( popup, 'options.backIgnore' )
            } ).last().value()

            if( _.get( lastPopup, 'component.back' ) ) {
              lastPopup.component.back.apply( lastPopup.componentInstance )
            }
          }
        } else {
          component.back = function() {
            this.$popupManager.close( this )
          }
        }
      }

      popupList.push( {
        component: component, popupKey: key,
        params: params, options: options,
        resolve: resolve
      } )

      if( anchorVm ) {
        anchorVm.$forceUpdate()
      }

      return { popupKey: key, promise: promise }
    },
    close: function( inst, retParam ) {
      if( !inst )
        return

      for( var i = 0; i < popupList.length; i++ ) {
        if( (inst instanceof Vue && inst === popupList[i].componentInstance) ||
          (inst instanceof Vue && inst === popupList[i].popupInstance) ||
          inst.popupKey === popupList[i].popupKey ) {

          var resolve = popupList[i].resolve
          popupList.splice( i, 1 )

          if( anchorVm ) {
            anchorVm.$forceUpdate()
          }

          resolve( retParam )
          return
        }
      }
    },
    isOpened: function( component ) {
      return !!_.find( popupList, { component } )
    },
    isTop: function( inst ) {
      if( !inst )
        throw new Error( 'null parameter' )

      for( var i = 0; i < popupList.length; i++ ) {
        if( (inst instanceof Vue && inst === popupList[i].componentInstance) ||
            (inst instanceof Vue && inst === popupList[i].popupInstance) ||
            inst.popupKey === popupList[i].popupKey ) {
          return i >= popupList.length - 1
        }
      }

      throw new Error( 'instance not exist' )
    }
  }

  Object.defineProperty( Vue.prototype, '$popupManager', {
    get() { return popupManager }
  } )

  Vue.component( 'popup-anchor', {
    name: 'popup-anchor',
    created() {
      anchorVm = this
    },
    render( h ) {
      var children = popupList.map( popup => {
        return h( 'div', {
          key: popup.popupKey,
          attrs: {
            'popupmanagerpopup': 'true'
          },
          class: {
            'popup-wrapper': true,
            'full-screen': _.get( popup, 'options.fullscreen' ) || false,
            'pure-wrapper': _.get( popup, 'options.pureWrapper' ) || false,
            'transparent-window': _.get( popup, 'options.transparentWindow' ) || false,
          },
          hook: {
            create: function( _, vnode ) {
              popup.popupInstance = vnode.componentInstance
            }
          }
        }, [
          h( 'div', {
            class: {
              'popup-container': true,
              'full-screen': _.get( popup, 'options.fullscreen' ) || false
            }
          }, [
            h( popup.component, {
              props: popup.params ? popup.params : {},
              hook: {
                create: function( _, vnode ) {
                  popup.componentInstance = vnode.componentInstance
                },
              }
            } )
          ] )
        ] )
      } )

      return h( 'div', children )
    }
  } )
}
