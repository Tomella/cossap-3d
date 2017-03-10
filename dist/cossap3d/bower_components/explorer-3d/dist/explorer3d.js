// WARNING: Don't edit.
// This file contains all the content from the dependencies directory. It's rolled up into the explorer3d.js file.

/**
 * @author James Baicoianu / http://www.baicoianu.com/
 */

THREE.FlyControls = function ( object, domElement ) {

   this.object = object;

   this.domElement = ( domElement !== undefined ) ? domElement : document;
   if ( domElement ) this.domElement.setAttribute( 'tabindex', - 1 );

   // API

   this.movementSpeed = 1.0;
   this.rollSpeed = 0.005;

   this.dragToLook = false;
   this.autoForward = false;

   // disable default target object behavior

   // internals

   this.tmpQuaternion = new THREE.Quaternion();

   this.mouseStatus = 0;

   this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
   this.moveVector = new THREE.Vector3( 0, 0, 0 );
   this.rotationVector = new THREE.Vector3( 0, 0, 0 );

   this.handleEvent = function ( event ) {

      if ( typeof this[ event.type ] == 'function' ) {

         this[ event.type ]( event );

      }

   };

   this.keydown = function( event ) {

      if ( event.altKey ) {

         return;

      }

      //event.preventDefault();

      switch ( event.keyCode ) {

         case 16: /* shift */ this.movementSpeedMultiplier = .1; break;

         case 87: /*W*/ this.moveState.forward = 1; break;
         case 83: /*S*/ this.moveState.back = 1; break;

         case 65: /*A*/ this.moveState.left = 1; break;
         case 68: /*D*/ this.moveState.right = 1; break;

         case 82: /*R*/ this.moveState.up = 1; break;
         case 70: /*F*/ this.moveState.down = 1; break;

         case 38: /*up*/ this.moveState.pitchUp = 1; break;
         case 40: /*down*/ this.moveState.pitchDown = 1; break;

         case 37: /*left*/ this.moveState.yawLeft = 1; break;
         case 39: /*right*/ this.moveState.yawRight = 1; break;

         case 81: /*Q*/ this.moveState.rollLeft = 1; break;
         case 69: /*E*/ this.moveState.rollRight = 1; break;

      }

      this.updateMovementVector();
      this.updateRotationVector();

   };

   this.keyup = function( event ) {

      switch ( event.keyCode ) {

         case 16: /* shift */ this.movementSpeedMultiplier = 1; break;

         case 87: /*W*/ this.moveState.forward = 0; break;
         case 83: /*S*/ this.moveState.back = 0; break;

         case 65: /*A*/ this.moveState.left = 0; break;
         case 68: /*D*/ this.moveState.right = 0; break;

         case 82: /*R*/ this.moveState.up = 0; break;
         case 70: /*F*/ this.moveState.down = 0; break;

         case 38: /*up*/ this.moveState.pitchUp = 0; break;
         case 40: /*down*/ this.moveState.pitchDown = 0; break;

         case 37: /*left*/ this.moveState.yawLeft = 0; break;
         case 39: /*right*/ this.moveState.yawRight = 0; break;

         case 81: /*Q*/ this.moveState.rollLeft = 0; break;
         case 69: /*E*/ this.moveState.rollRight = 0; break;

      }

      this.updateMovementVector();
      this.updateRotationVector();

   };

   this.mousedown = function( event ) {

      if ( this.domElement !== document ) {

         this.domElement.focus();

      }

      event.preventDefault();
      event.stopPropagation();

      if ( this.dragToLook ) {

         this.mouseStatus ++;

      } else {

         switch ( event.button ) {

            case 0: this.moveState.forward = 1; break;
            case 2: this.moveState.back = 1; break;

         }

         this.updateMovementVector();

      }

   };

   this.mousemove = function( event ) {

      if ( ! this.dragToLook || this.mouseStatus > 0 ) {

         var container = this.getContainerDimensions();
         var halfWidth  = container.size[ 0 ] / 2;
         var halfHeight = container.size[ 1 ] / 2;

         this.moveState.yawLeft   = - ( ( event.pageX - container.offset[ 0 ] ) - halfWidth  ) / halfWidth;
         this.moveState.pitchDown =   ( ( event.pageY - container.offset[ 1 ] ) - halfHeight ) / halfHeight;

         this.updateRotationVector();

      }

   };

   this.mouseup = function( event ) {

      event.preventDefault();
      event.stopPropagation();

      if ( this.dragToLook ) {

         this.mouseStatus --;

         this.moveState.yawLeft = this.moveState.pitchDown = 0;

      } else {

         switch ( event.button ) {

            case 0: this.moveState.forward = 0; break;
            case 2: this.moveState.back = 0; break;

         }

         this.updateMovementVector();

      }

      this.updateRotationVector();

   };

   this.update = function( delta ) {

      var moveMult = delta * this.movementSpeed;
      var rotMult = delta * this.rollSpeed;

      this.object.translateX( this.moveVector.x * moveMult );
      this.object.translateY( this.moveVector.y * moveMult );
      this.object.translateZ( this.moveVector.z * moveMult );

      this.tmpQuaternion.set( this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1 ).normalize();
      this.object.quaternion.multiply( this.tmpQuaternion );

      // expose the rotation vector for convenience
      this.object.rotation.setFromQuaternion( this.object.quaternion, this.object.rotation.order );


   };

   this.updateMovementVector = function() {

      var forward = ( this.moveState.forward || ( this.autoForward && ! this.moveState.back ) ) ? 1 : 0;

      this.moveVector.x = ( - this.moveState.left    + this.moveState.right );
      this.moveVector.y = ( - this.moveState.down    + this.moveState.up );
      this.moveVector.z = ( - forward + this.moveState.back );

      //console.log( 'move:', [ this.moveVector.x, this.moveVector.y, this.moveVector.z ] );

   };

   this.updateRotationVector = function() {

      this.rotationVector.x = ( - this.moveState.pitchDown + this.moveState.pitchUp );
      this.rotationVector.y = ( - this.moveState.yawRight  + this.moveState.yawLeft );
      this.rotationVector.z = ( - this.moveState.rollRight + this.moveState.rollLeft );

      //console.log( 'rotate:', [ this.rotationVector.x, this.rotationVector.y, this.rotationVector.z ] );

   };

   this.getContainerDimensions = function() {

      if ( this.domElement != document ) {

         return {
            size   : [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
            offset   : [ this.domElement.offsetLeft,  this.domElement.offsetTop ]
         };

      } else {

         return {
            size   : [ window.innerWidth, window.innerHeight ],
            offset   : [ 0, 0 ]
         };

      }

   };

   function bind( scope, fn ) {

      return function () {

         fn.apply( scope, arguments );

      };

   }

   function contextmenu( event ) {

      event.preventDefault();

   }

   this.dispose = function() {

      this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
      this.domElement.removeEventListener( 'mousedown', _mousedown, false );
      this.domElement.removeEventListener( 'mousemove', _mousemove, false );
      this.domElement.removeEventListener( 'mouseup', _mouseup, false );

      window.removeEventListener( 'keydown', _keydown, false );
      window.removeEventListener( 'keyup', _keyup, false );

   }

   var _mousemove = bind( this, this.mousemove );
   var _mousedown = bind( this, this.mousedown );
   var _mouseup = bind( this, this.mouseup );
   var _keydown = bind( this, this.keydown );
   var _keyup = bind( this, this.keyup );

   this.domElement.addEventListener( 'contextmenu', contextmenu, false );

   this.domElement.addEventListener( 'mousemove', _mousemove, false );
   this.domElement.addEventListener( 'mousedown', _mousedown, false );
   this.domElement.addEventListener( 'mouseup',   _mouseup, false );

   window.addEventListener( 'keydown', _keydown, false );
   window.addEventListener( 'keyup',   _keyup, false );

   this.updateMovementVector();
   this.updateRotationVector();

};

/**
 * @author daron1337 / http://daron1337.github.io/
 */

THREE.Lut = function ( colormap, numberofcolors ) {

   this.lut = [];
   this.map = THREE.ColorMapKeywords[ colormap ];
   this.n = numberofcolors;
   this.mapname = colormap;

   var step = 1.0 / this.n;

   for ( var i = 0; i <= 1; i += step ) {

      for ( var j = 0; j < this.map.length - 1; j ++ ) {

         if ( i >= this.map[ j ][ 0 ] && i < this.map[ j + 1 ][ 0 ] ) {

            var min = this.map[ j ][ 0 ];
            var max = this.map[ j + 1 ][ 0 ];

            var color = new THREE.Color( 0xffffff );
            var minColor = new THREE.Color( 0xffffff ).setHex( this.map[ j ][ 1 ] );
            var maxColor = new THREE.Color( 0xffffff ).setHex( this.map[ j + 1 ][ 1 ] );

            color = minColor.lerp( maxColor, ( i - min ) / ( max - min ) );

            this.lut.push( color );

         }

      }

   }

   return this.set( this );

};

THREE.Lut.prototype = {

   constructor: THREE.Lut,

   lut: [], map: [], mapname: 'rainbow', n: 256, minV: 0, maxV: 1, legend: null,

   set: function ( value ) {

      if ( value instanceof THREE.Lut ) {

         this.copy( value );

      }

      return this;

   },

   setMin: function ( min ) {

      this.minV = min;

      return this;

   },

   setMax: function ( max ) {

      this.maxV = max;

      return this;

   },

   changeNumberOfColors: function ( numberofcolors ) {

      this.n = numberofcolors;

      return new THREE.Lut( this.mapname, this.n );

   },

   changeColorMap: function ( colormap ) {

      this.mapname = colormap;

      return new THREE.Lut( this.mapname, this.n );

   },

   copy: function ( lut ) {

      this.lut = lut.lut;
      this.mapname = lut.mapname;
      this.map = lut.map;
      this.n = lut.n;
      this.minV = lut.minV;
      this.maxV = lut.maxV;

      return this;

   },

   getColor: function ( alpha ) {

      if ( alpha <= this.minV ) {

         alpha = this.minV;

      } else if ( alpha >= this.maxV ) {

         alpha = this.maxV;

      }

      alpha = ( alpha - this.minV ) / ( this.maxV - this.minV );

      var colorPosition = Math.round ( alpha * this.n );
      colorPosition == this.n ? colorPosition -= 1 : colorPosition;

      return this.lut[ colorPosition ];

   },

   addColorMap: function ( colormapName, arrayOfColors ) {

      THREE.ColorMapKeywords[ colormapName ] = arrayOfColors;

   },

   setLegendOn: function ( parameters ) {

      if ( parameters === undefined ) {

         parameters = {};

      }

      this.legend = {};

      this.legend.layout = parameters.hasOwnProperty( 'layout' ) ? parameters[ 'layout' ] : 'vertical';

      this.legend.position = parameters.hasOwnProperty( 'position' ) ? parameters[ 'position' ] : { 'x': 21.5, 'y': 8, 'z': 5 };

      this.legend.dimensions = parameters.hasOwnProperty( 'dimensions' ) ? parameters[ 'dimensions' ] : { 'width': 0.5, 'height': 3 };

      this.legend.canvas = document.createElement( 'canvas' );

      this.legend.canvas.setAttribute( 'id', 'legend' );
      this.legend.canvas.setAttribute( 'hidden', true );

      document.body.appendChild( this.legend.canvas );

      this.legend.ctx = this.legend.canvas.getContext( '2d' );

      this.legend.canvas.setAttribute( 'width',  1 );
      this.legend.canvas.setAttribute( 'height', this.n );

      this.legend.texture = new THREE.Texture( this.legend.canvas );

      imageData = this.legend.ctx.getImageData( 0, 0, 1, this.n );

      data = imageData.data;
      len = data.length;

      this.map = THREE.ColorMapKeywords[ this.mapname ];

      var k = 0;

      var step = 1.0 / this.n;

      for ( var i = 1; i >= 0; i -= step ) {

         for ( var j = this.map.length - 1; j >= 0; j -- ) {

            if ( i < this.map[ j ][ 0 ] && i >= this.map[ j - 1 ][ 0 ]  ) {

               var min = this.map[ j - 1 ][ 0 ];
               var max = this.map[ j ][ 0 ];
               var color = new THREE.Color( 0xffffff );
               var minColor = new THREE.Color( 0xffffff ).setHex( this.map[ j - 1 ][ 1 ] );
               var maxColor = new THREE.Color( 0xffffff ).setHex( this.map[ j ][ 1 ] );
               color = minColor.lerp( maxColor, ( i - min ) / ( max - min ) );

               data[ k * 4 ] = Math.round( color.r * 255 );
               data[ k * 4 + 1 ] = Math.round( color.g * 255 );
               data[ k * 4 + 2 ] = Math.round( color.b * 255 );
               data[ k * 4 + 3 ] = 255;

               k += 1;

            }

         }

      }

      this.legend.ctx.putImageData( imageData, 0, 0 );
      this.legend.texture.needsUpdate = true;

      this.legend.legendGeometry = new THREE.PlaneBufferGeometry( this.legend.dimensions.width, this.legend.dimensions.height );
      this.legend.legendMaterial = new THREE.MeshBasicMaterial( { map : this.legend.texture, side : THREE.DoubleSide } );

      this.legend.mesh = new THREE.Mesh( this.legend.legendGeometry, this.legend.legendMaterial );

      if ( this.legend.layout == 'horizontal' ) {

         this.legend.mesh.rotation.z = - 90 * ( Math.PI / 180 );

      }

      this.legend.mesh.position.copy( this.legend.position );

      return this.legend.mesh;

   },

   setLegendOff: function () {

      this.legend = null;

      return this.legend;

   },

   setLegendLayout: function ( layout ) {

      if ( ! this.legend ) {

         return false;

      }

      if ( this.legend.layout == layout ) {

         return false;

      }

      if ( layout != 'horizontal' && layout != 'vertical' ) {

         return false;

      }

      this.layout = layout;

      if ( layout == 'horizontal' ) {

         this.legend.mesh.rotation.z = 90 * ( Math.PI / 180 );

      }

      if ( layout == 'vertical' ) {

         this.legend.mesh.rotation.z = - 90 * ( Math.PI / 180 );

      }

      return this.legend.mesh;

   },

   setLegendPosition: function ( position ) {

      this.legend.position = new THREE.Vector3( position.x, position.y, position.z );

      return this.legend;

   },

   setLegendLabels: function ( parameters, callback ) {

      if ( ! this.legend ) {

         return false;

      }

      if ( typeof parameters === 'function' ) {

         callback = parameters;

      }

      if ( parameters === undefined ) {

         parameters = {};

      }

      this.legend.labels = {};

      this.legend.labels.fontsize = parameters.hasOwnProperty( 'fontsize' ) ? parameters[ 'fontsize' ] : 24;

      this.legend.labels.fontface = parameters.hasOwnProperty( 'fontface' ) ? parameters[ 'fontface' ] : 'Arial';

      this.legend.labels.title = parameters.hasOwnProperty( 'title' ) ? parameters[ 'title' ] : '';

      this.legend.labels.um = parameters.hasOwnProperty( 'um' ) ? ' [ ' + parameters[ 'um' ] + ' ]' : '';

      this.legend.labels.ticks = parameters.hasOwnProperty( 'ticks' ) ? parameters[ 'ticks' ] : 0;

      this.legend.labels.decimal = parameters.hasOwnProperty( 'decimal' ) ? parameters[ 'decimal' ] : 2;

      this.legend.labels.notation = parameters.hasOwnProperty( 'notation' ) ? parameters[ 'notation' ] : 'standard';

      var backgroundColor = { r: 255, g: 100, b: 100, a: 0.8 };
      var borderColor =  { r: 255, g: 0, b: 0, a: 1.0 };
      var borderThickness = 4;

      var canvasTitle = document.createElement( 'canvas' );
      var contextTitle = canvasTitle.getContext( '2d' );

      contextTitle.font = 'Normal ' + this.legend.labels.fontsize * 1.2 + 'px ' + this.legend.labels.fontface;

      var metrics = contextTitle.measureText( this.legend.labels.title.toString() + this.legend.labels.um.toString() );
      var textWidth = metrics.width;

      contextTitle.fillStyle   = 'rgba(' + backgroundColor.r + ',' + backgroundColor.g + ',' + backgroundColor.b + ',' + backgroundColor.a + ')';

      contextTitle.strokeStyle = 'rgba(' + borderColor.r + ',' + borderColor.g + ',' + borderColor.b + ',' + borderColor.a + ')';

      contextTitle.lineWidth = borderThickness;

      contextTitle.fillStyle = 'rgba( 0, 0, 0, 1.0 )';

      contextTitle.fillText( this.legend.labels.title.toString() + this.legend.labels.um.toString(), borderThickness, this.legend.labels.fontsize + borderThickness );

      var txtTitle = new THREE.CanvasTexture( canvasTitle );
      txtTitle.minFilter = THREE.LinearFilter;

      var spriteMaterialTitle = new THREE.SpriteMaterial( { map: txtTitle } );

      var spriteTitle = new THREE.Sprite( spriteMaterialTitle );

      spriteTitle.scale.set( 2, 1, 1.0 );

      if ( this.legend.layout == 'vertical' ) {

         spriteTitle.position.set( this.legend.position.x + this.legend.dimensions.width, this.legend.position.y + ( this.legend.dimensions.height * 0.45 ), this.legend.position.z );

      }

      if ( this.legend.layout == 'horizontal' ) {

         spriteTitle.position.set( this.legend.position.x * 1.015, this.legend.position.y + ( this.legend.dimensions.height * 0.03 ), this.legend.position.z );

      }

      if ( this.legend.labels.ticks > 0 ) {

         var ticks = {};
         var lines = {};

         if ( this.legend.layout == 'vertical' ) {

            var topPositionY = this.legend.position.y + ( this.legend.dimensions.height * 0.36 );
            var bottomPositionY = this.legend.position.y - ( this.legend.dimensions.height * 0.61 );

         }

         if ( this.legend.layout == 'horizontal' ) {

            var topPositionX = this.legend.position.x + ( this.legend.dimensions.height * 0.75 );
            var bottomPositionX = this.legend.position.x - ( this.legend.dimensions.width * 1.2  ) ;

         }

         for ( var i = 0; i < this.legend.labels.ticks; i ++ ) {

            var value = ( this.maxV - this.minV ) / ( this.legend.labels.ticks - 1  ) * i + this.minV;

            if ( callback ) {

               value = callback ( value );

            } else {

               if ( this.legend.labels.notation == 'scientific' ) {

                  value = value.toExponential( this.legend.labels.decimal );

               } else {

                  value = value.toFixed( this.legend.labels.decimal );

               }

            }

            var canvasTick = document.createElement( 'canvas' );
            var contextTick = canvasTick.getContext( '2d' );

            contextTick.font = 'Normal ' + this.legend.labels.fontsize + 'px ' + this.legend.labels.fontface;

            var metrics = contextTick.measureText( value.toString() );
            var textWidth = metrics.width;

            contextTick.fillStyle   = 'rgba(' + backgroundColor.r + ',' + backgroundColor.g + ',' + backgroundColor.b + ',' + backgroundColor.a + ')';

            contextTick.strokeStyle = 'rgba(' + borderColor.r + ',' + borderColor.g + ',' + borderColor.b + ',' + borderColor.a + ')';

            contextTick.lineWidth = borderThickness;

            contextTick.fillStyle = 'rgba( 0, 0, 0, 1.0 )';

            contextTick.fillText( value.toString(), borderThickness, this.legend.labels.fontsize + borderThickness );

            var txtTick = new THREE.CanvasTexture( canvasTick );
            txtTick.minFilter = THREE.LinearFilter;

            var spriteMaterialTick = new THREE.SpriteMaterial( { map: txtTick } );

            var spriteTick = new THREE.Sprite( spriteMaterialTick );

            spriteTick.scale.set( 2, 1, 1.0 );

            if ( this.legend.layout == 'vertical' ) {

               var position = bottomPositionY + ( topPositionY - bottomPositionY ) * ( ( value - this.minV ) / ( this.maxV - this.minV ) );

               spriteTick.position.set( this.legend.position.x + ( this.legend.dimensions.width * 2.7 ), position, this.legend.position.z );

            }

            if ( this.legend.layout == 'horizontal' ) {

               var position = bottomPositionX + ( topPositionX - bottomPositionX ) * ( ( value - this.minV ) / ( this.maxV - this.minV ) );

               if ( this.legend.labels.ticks > 5 ) {

                  if ( i % 2 === 0 ) {

                     var offset = 1.7;

                  } else {

                     var offset = 2.1;

                  }

               } else {

                  var offset = 1.7;

               }

               spriteTick.position.set( position, this.legend.position.y - this.legend.dimensions.width * offset, this.legend.position.z );

            }

            var material = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 2 } );

            var geometry = new THREE.Geometry();


            if ( this.legend.layout == 'vertical' ) {

               var linePosition = ( this.legend.position.y - ( this.legend.dimensions.height * 0.5 ) + 0.01 ) + ( this.legend.dimensions.height ) * ( ( value - this.minV ) / ( this.maxV - this.minV ) * 0.99 );

               geometry.vertices.push( new THREE.Vector3( this.legend.position.x + this.legend.dimensions.width * 0.55, linePosition, this.legend.position.z  ) );

               geometry.vertices.push( new THREE.Vector3( this.legend.position.x + this.legend.dimensions.width * 0.7, linePosition, this.legend.position.z  ) );

            }

            if ( this.legend.layout == 'horizontal' ) {

               var linePosition = ( this.legend.position.x - ( this.legend.dimensions.height * 0.5 ) + 0.01 ) + ( this.legend.dimensions.height ) * ( ( value - this.minV ) / ( this.maxV - this.minV ) * 0.99 );

               geometry.vertices.push( new THREE.Vector3( linePosition, this.legend.position.y - this.legend.dimensions.width * 0.55, this.legend.position.z  ) );

               geometry.vertices.push( new THREE.Vector3( linePosition, this.legend.position.y - this.legend.dimensions.width * 0.7, this.legend.position.z  ) );

            }

            var line = new THREE.Line( geometry, material );

            lines[ i ] = line;
            ticks[ i ] = spriteTick;

         }

      }

      return { 'title': spriteTitle,  'ticks': ticks, 'lines': lines };

   }

};


THREE.ColorMapKeywords = {

   "rainbow":    [ [ 0.0, '0x0000FF' ], [ 0.2, '0x00FFFF' ], [ 0.5, '0x00FF00' ], [ 0.8, '0xFFFF00' ],  [ 1.0, '0xFF0000' ] ],
   "cooltowarm": [ [ 0.0, '0x3C4EC2' ], [ 0.2, '0x9BBCFF' ], [ 0.5, '0xDCDCDC' ], [ 0.8, '0xF6A385' ],  [ 1.0, '0xB40426' ] ],
   "blackbody" : [ [ 0.0, '0x000000' ], [ 0.2, '0x780000' ], [ 0.5, '0xE63200' ], [ 0.8, '0xFFFF00' ],  [ 1.0, '0xFFFFFF' ] ],
   "grayscale" : [ [ 0.0, '0x000000' ], [ 0.2, '0x404040' ], [ 0.5, '0x7F7F80' ], [ 0.8, '0xBFBFBF' ],  [ 1.0, '0xFFFFFF' ] ],
   "water" :     [ [ 0.0, '0x0000aa' ], [ 0.2, '0x2020bb' ], [ 0.5, '0x5050cc' ], [ 0.8, '0x8080dd' ],  [ 1.0, '0xa0a0ff' ] ],
   "land" :      [ [ 0.0, '0x128A47' ], [ 0.2, '0xd9E775' ], [ 0.4, '0xDAEF7A' ], [ 0.7, '0xEDF97D' ],  [ 1.0, '0xffffff' ] ]
};
/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.OrbitControls = function ( object, domElement ) {

   this.object = object;
   this.domElement = ( domElement !== undefined ) ? domElement : document;

   // API

   this.enabled = true;

   this.center = new THREE.Vector3();

   this.userZoom = true;
   this.userZoomSpeed = 1.0;

   this.userRotate = true;
   this.userRotateSpeed = 1.0;

   this.userPan = true;
   this.userPanSpeed = 2.0;

   this.autoRotate = false;
   this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

   this.minPolarAngle = 0; // radians
   this.maxPolarAngle = Math.PI; // radians

   this.minDistance = 0;
   this.maxDistance = Infinity;

   // 65 /*A*/, 83 /*S*/, 68 /*D*/
   this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40, ROTATE: 65, ZOOM: 83, PAN: 68 };

   // internals

   var scope = this;

   var EPS = 0.000001;
   var PIXELS_PER_ROUND = 1800;

   var rotateStart = new THREE.Vector2();
   var rotateEnd = new THREE.Vector2();
   var rotateDelta = new THREE.Vector2();

   var zoomStart = new THREE.Vector2();
   var zoomEnd = new THREE.Vector2();
   var zoomDelta = new THREE.Vector2();

   var phiDelta = 0;
   var thetaDelta = 0;
   var scale = 1;

   var lastPosition = new THREE.Vector3();

   var STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 };
   var state = STATE.NONE;

   // events

   var changeEvent = { type: 'change' };


   this.rotateLeft = function ( angle ) {

      if ( angle === undefined ) {

         angle = getAutoRotationAngle();

      }

      thetaDelta -= angle;

   };

   this.rotateRight = function ( angle ) {

      if ( angle === undefined ) {

         angle = getAutoRotationAngle();

      }

      thetaDelta += angle;

   };

   this.rotateUp = function ( angle ) {

      if ( angle === undefined ) {

         angle = getAutoRotationAngle();

      }

      phiDelta -= angle;

   };

   this.rotateDown = function ( angle ) {

      if ( angle === undefined ) {

         angle = getAutoRotationAngle();

      }

      phiDelta += angle;

   };

   this.zoomIn = function ( zoomScale ) {

      if ( zoomScale === undefined ) {

         zoomScale = getZoomScale();

      }

      scale /= zoomScale;

   };

   this.zoomOut = function ( zoomScale ) {

      if ( zoomScale === undefined ) {

         zoomScale = getZoomScale();

      }

      scale *= zoomScale;

   };

   this.pan = function ( distance ) {

      distance.transformDirection( this.object.matrix );
      distance.multiplyScalar( scope.userPanSpeed );

      this.object.position.add( distance );
      this.center.add( distance );

   };

   this.update = function () {

      var position = this.object.position;
      var offset = position.clone().sub( this.center );

      // angle from z-axis around y-axis

      var theta = Math.atan2( offset.x, offset.z );

      // angle from y-axis

      var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

      if ( this.autoRotate ) {

         this.rotateLeft( getAutoRotationAngle() );

      }

      theta += thetaDelta;
      phi += phiDelta;

      // restrict phi to be between desired limits
      phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

      // restrict phi to be betwee EPS and PI-EPS
      phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

      var radius = offset.length() * scale;

      // restrict radius to be between desired limits
      radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

      offset.x = radius * Math.sin( phi ) * Math.sin( theta );
      offset.y = radius * Math.cos( phi );
      offset.z = radius * Math.sin( phi ) * Math.cos( theta );

      position.copy( this.center ).add( offset );

      this.object.lookAt( this.center );

      thetaDelta = 0;
      phiDelta = 0;
      scale = 1;

      if ( lastPosition.distanceTo( this.object.position ) > 0 ) {

         this.dispatchEvent( changeEvent );

         lastPosition.copy( this.object.position );

      }

   };


   function getAutoRotationAngle() {

      return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

   }

   function getZoomScale() {

      return Math.pow( 0.95, scope.userZoomSpeed );

   }

   function onMouseDown( event ) {

      if ( scope.enabled === false ) return;
      if ( scope.userRotate === false ) return;

      event.preventDefault();

      if ( state === STATE.NONE )
      {
         if ( event.button === 0 )
            state = STATE.ROTATE;
         if ( event.button === 1 )
            state = STATE.ZOOM;
         if ( event.button === 2 )
            state = STATE.PAN;
      }


      if ( state === STATE.ROTATE ) {

         //state = STATE.ROTATE;

         rotateStart.set( event.clientX, event.clientY );

      } else if ( state === STATE.ZOOM ) {

         //state = STATE.ZOOM;

         zoomStart.set( event.clientX, event.clientY );

      } else if ( state === STATE.PAN ) {

         //state = STATE.PAN;

      }

      document.addEventListener( 'mousemove', onMouseMove, false );
      document.addEventListener( 'mouseup', onMouseUp, false );

   }

   function onMouseMove( event ) {

      if ( scope.enabled === false ) return;

      event.preventDefault();



      if ( state === STATE.ROTATE ) {

         rotateEnd.set( event.clientX, event.clientY );
         rotateDelta.subVectors( rotateEnd, rotateStart );

         scope.rotateLeft( 2 * Math.PI * rotateDelta.x / PIXELS_PER_ROUND * scope.userRotateSpeed );
         scope.rotateUp( 2 * Math.PI * rotateDelta.y / PIXELS_PER_ROUND * scope.userRotateSpeed );

         rotateStart.copy( rotateEnd );

      } else if ( state === STATE.ZOOM ) {

         zoomEnd.set( event.clientX, event.clientY );
         zoomDelta.subVectors( zoomEnd, zoomStart );

         if ( zoomDelta.y > 0 ) {

            scope.zoomIn();

         } else {

            scope.zoomOut();

         }

         zoomStart.copy( zoomEnd );

      } else if ( state === STATE.PAN ) {

         var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
         var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

         scope.pan( new THREE.Vector3( - movementX, movementY, 0 ) );

      }

   }

   function onMouseUp( event ) {

      if ( scope.enabled === false ) return;
      if ( scope.userRotate === false ) return;

      document.removeEventListener( 'mousemove', onMouseMove, false );
      document.removeEventListener( 'mouseup', onMouseUp, false );

      state = STATE.NONE;

   }

   function onMouseWheel( event ) {

      if ( scope.enabled === false ) return;
      if ( scope.userZoom === false ) return;

      var delta = 0;

      if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

         delta = event.wheelDelta;

      } else if ( event.detail ) { // Firefox

         delta = - event.detail;

      }

      if ( delta > 0 ) {

         scope.zoomOut();

      } else {

         scope.zoomIn();

      }

   }

   function onKeyDown( event ) {
      event.preventDefault();

      if ( scope.enabled === false ) return;
      if ( scope.userPan === false ) return;

      switch ( event.keyCode ) {

         case scope.keys.UP:
            scope.pan( new THREE.Vector3( 0, 1, 0 ) );
            break;
         case scope.keys.BOTTOM:
            scope.pan( new THREE.Vector3( 0, - 1, 0 ) );
            break;
         case scope.keys.LEFT:
            scope.pan( new THREE.Vector3( - 1, 0, 0 ) );
            break;
         case scope.keys.RIGHT:
            scope.pan( new THREE.Vector3( 1, 0, 0 ) );
            break;

         case scope.keys.ROTATE:
            state = STATE.ROTATE;
            break;
         case scope.keys.ZOOM:
            state = STATE.ZOOM;
            break;
         case scope.keys.PAN:
            state = STATE.PAN;
            break;

      }

   }

   function onKeyUp( event ) {
      event.preventDefault();

      switch ( event.keyCode ) {

         case scope.keys.ROTATE:
         case scope.keys.ZOOM:
         case scope.keys.PAN:
            state = STATE.NONE;
            break;
      }

   }

   this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
   this.domElement.addEventListener( 'mousedown', onMouseDown, false );
   this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
   this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox
   window.addEventListener( 'keydown', onKeyDown, false );
   window.addEventListener( 'keyup', onKeyUp, false );

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );

if (typeof Object.assign != 'function') {
  Object.assign = function (target, varArgs) { // .length of function is 2
    'use strict';
    if (target == null) { // TypeError if undefined or null
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) { // Skip over if undefined or null
        for (var nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}
/** For some reason the typescript transpiler is leaving this out so here it is as a hack. */
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};

var Promise = (this && this.Promise) || this.ES6Promise;

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}(function (global, factory) {
   typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
   typeof define === 'function' && define.amd ? define(['exports'], factory) :
   (factory((global.Explorer3d = global.Explorer3d || {})));
}(this, (function (exports) { 'use strict';

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}







function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
}

var EventDispatcher = (function () {
    function EventDispatcher() {
    }
    EventDispatcher.prototype.addEventListener = function (type, listener) {
        if (this.listeners === undefined)
            this.listeners = {};
        var listeners = this.listeners;
        if (listeners[type] === undefined) {
            listeners[type] = [];
        }
        if (listeners[type].indexOf(listener) === -1) {
            listeners[type].push(listener);
        }
    };
    EventDispatcher.prototype.hasEventListener = function (type, listener) {
        if (this.listeners === undefined)
            return false;
        var listeners = this.listeners;
        if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1) {
            return true;
        }
        return false;
    };
    EventDispatcher.prototype.removeEventListener = function (type, listener) {
        if (this.listeners === undefined)
            return;
        var listenerArray = this.listeners[type];
        if (listenerArray !== undefined) {
            this.listeners[type] = listenerArray.filter(function (existing) { return listener !== existing; });
        }
    };
    EventDispatcher.prototype.dispatchEvent = function (event) {
        var _this = this;
        var listeners = this.listeners;
        if (listeners === undefined)
            return;
        var array = [];
        var listenerArray = listeners[event.type];
        if (listenerArray !== undefined) {
            event.target = this;
            listenerArray.forEach(function (listener) { return listener.call(_this, event); });
        }
    };
    EventDispatcher.prototype.removeAllListeners = function () {
        this.listeners = undefined;
    };
    return EventDispatcher;
}());

var Pusher = (function (_super) {
    __extends(Pusher, _super);
    function Pusher() {
        var _this = _super.call(this) || this;
        _this.complete = false;
        return _this;
    }
    return Pusher;
}(EventDispatcher));

var EventNames = (function () {
    function EventNames() {
    }
    return EventNames;
}());
EventNames.names = [
    "bstones",
    "borders",
    "complete",
    "header",
    "vertices",
    "faces",
    "lines",
    "properties"
];

function atom(atm) {
    var parts = atm.split(/\s+/g);
    var length = parts.length;
    var response = {
        get xyz() {
            return [this.x, this.y, this.z];
        }
    };
    parts.forEach(function (item, i) {
        switch (i) {
            case 0: break;
            case 1:
                response.index = parseInt(item) - 1;
                break;
            case 2:
                response.vertexId = parseFloat(item) - 1;
                break;
            case 3:
                response.properties = [];
            // Fall through to populate
            default:
                response.properties.push(item);
        }
    });
    return response;
}

function border(border) {
    var parts = border.split(/\s+/g);
    return {
        id: +parts[1] - 1,
        vertices: [
            +parts[2] - 1,
            +parts[3] - 1
        ]
    };
}

function bstone(bstone) {
    var parts = bstone.split(/\s+/g);
    return parseInt(parts[1]) - 1;
}

// We are zero based, GoCad is 1 based
// We are zero based, GoCad is 1 based
function face(face) {
    var parts = face.split(/\s+/g);
    var length = parts.length;
    var response = {
        get abc() {
            return [this.a, this.b, this.c];
        }
    };
    if (length === 4) {
        response.a = parseInt(parts[1]) - 1;
        response.b = parseFloat(parts[2]) - 1;
        response.c = parseFloat(parts[3]) - 1;
    }
    return response;
}

function vertex(vrtx, projectionFn, zDirection) {
    var parts = vrtx.split(/\s+/g);
    var length = parts.length;
    var zSign = zDirection ? zDirection : 1;
    var coord = [];
    var response = {
        get xyz() {
            return [this.x, this.y, this.z];
        },
        get all() {
            var data = [this.x, this.y, this.z];
            if (this.properties) {
                this.properties.forEach(function (item) {
                    data.push(item);
                });
            }
            return data;
        }
    };
    parts.forEach(function (item, i) {
        switch (i) {
            case 0: break;
            case 1:
                response.index = +item - 1;
                break;
            case 2:
                coord[0] = +item;
                // response.x = parseFloat(item);
                break;
            case 3:
                coord[1] = +item;
                // response.y = parseFloat(item);
                break;
            case 4:
                response.z = +item * zSign;
                break;
            case 5:
                response.properties = [];
            // Fall through to populate
            default:
                response.properties.push(item);
        }
    });
    if (projectionFn) {
        coord = projectionFn(coord);
    }
    response.x = coord[0];
    response.y = coord[1];
    return response;
}

var Event = (function () {
    function Event(type, data, target) {
        this.type = type;
        this.data = data;
        this.target = target;
    }
    return Event;
}());

var Box = (function () {
    function Box(min, max) {
        this.min = min;
        this.max = max;
    }
    return Box;
}());

var Vector3 = (function () {
    function Vector3(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return Vector3;
}());

var BoxFactory = (function () {
    function BoxFactory() {
    }
    BoxFactory.fromVertices = function (vertices) {
        if (vertices === void 0) { vertices = []; }
        var box;
        vertices.forEach(function (vertex) {
            box = BoxFactory.expand(box, vertex);
        });
        return box;
    };
    BoxFactory.expand = function (box, vertex) {
        if (box === void 0) { box = new Box(new Vector3(Infinity, Infinity, Infinity), new Vector3(-Infinity, -Infinity, -Infinity)); }
        box.min.x = Math.min(box.min.x, vertex[0]);
        box.min.y = Math.min(box.min.y, vertex[1]);
        box.min.z = Math.min(box.min.z, vertex[2]);
        box.max.x = Math.max(box.max.x, vertex[0]);
        box.max.y = Math.max(box.max.y, vertex[1]);
        box.max.z = Math.max(box.max.z, vertex[2]);
        return box;
    };
    BoxFactory.toThreeBox3 = function (box) {
        return new THREE.Box3(new THREE.Vector3(box.min.x, box.min.y, box.min.z), new THREE.Vector3(box.max.x, box.max.y, box.max.z));
    };
    return BoxFactory;
}());

var VectorFactory = (function () {
    function VectorFactory() {
    }
    VectorFactory.subVectors = function (a, b) {
        return new Vector3(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    };
    VectorFactory.cross = function (v, w) {
        var vx = v.x, vy = v.y, vz = v.z;
        var wx = w.x, wy = w.y, wz = w.z;
        var x = vy * wz - vz * wy;
        var y = vz * wx - vx * wz;
        var z = vx * wy - vy * wx;
        return new Vector3(x, y, z);
    };
    VectorFactory.normalize = function (v) {
        return VectorFactory.divideScalar(v, VectorFactory.calcLength(v));
    };
    VectorFactory.calcLength = function (v) {
        return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    };
    VectorFactory.divideScalar = function (v, scalar) {
        return VectorFactory.multiplyScalar(v, 1 / scalar);
    };
    VectorFactory.multiplyScalar = function (v, scalar) {
        if (isFinite(scalar)) {
            v.x *= scalar;
            v.y *= scalar;
            v.z *= scalar;
        }
        else {
            v.x = 0;
            v.y = 0;
            v.z = 0;
        }
        return v;
    };
    return VectorFactory;
}());

var FaceFactory = (function () {
    function FaceFactory() {
    }
    FaceFactory.computeNormal = function (face, vertices) {
        var a = vertices[face[0]];
        var b = vertices[face[1]];
        var c = vertices[face[2]];
        var cb = VectorFactory.subVectors(c, b);
        var ab = VectorFactory.subVectors(a, b);
        cb = VectorFactory.cross(cb, ab);
        VectorFactory.normalize(cb);
        face[3] = cb;
    };
    return FaceFactory;
}());

var Type = (function () {
    function Type() {
        this.type = "Type";
        this.isValid = false;
    }
    return Type;
}());

var TSurf = (function (_super) {
    __extends(TSurf, _super);
    function TSurf() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "TSurf";
        _this.vertices = [];
        _this.faces = [];
        _this.bstones = [];
        _this.borders = [];
        return _this;
    }
    return TSurf;
}(Type));

var CoordinateSystem = (function () {
    function CoordinateSystem() {
        this.isValid = true;
        this.typeMap = {
            AXIS_NAME: split,
            AXIS_UNIT: split
        };
    }
    return CoordinateSystem;
}());
function split(val) {
    return val.split(/\s+/g).map(function (str) {
        return str.replace(/\"/g, "");
    });
}

var StatePusher = (function (_super) {
    __extends(StatePusher, _super);
    function StatePusher() {
        var _this = _super.call(this) || this;
        _this.state = 0;
        return _this;
    }
    return StatePusher;
}(Pusher));

function isDataLine(line) {
    line = line.trim();
    return isNonEmpty(line) && line.indexOf("#") !== 0;
}
function isNonEmpty(line) {
    return line.trim().length !== 0;
}

var CoordinateSystemPusher = (function (_super) {
    __extends(CoordinateSystemPusher, _super);
    function CoordinateSystemPusher() {
        var _this = _super.call(this) || this;
        _this.coordinateSystem = new CoordinateSystem();
        _this.validHeader = false;
        return _this;
    }
    Object.defineProperty(CoordinateSystemPusher.prototype, "obj", {
        get: function () {
            return this.coordinateSystem;
        },
        enumerable: true,
        configurable: true
    });
    CoordinateSystemPusher.prototype.push = function (line) {
        if (this.complete) {
            throw new Error("Pushed line to completed tsurf pusher");
        }
        switch (this.state) {
            case 0:
                return this.hasBlock(line);
            case 1:
                return this.pushData(line);
        }
    };
    CoordinateSystemPusher.prototype.hasBlock = function (line) {
        line = line.trim();
        if (line.length) {
            if (line !== "GOCAD_ORIGINAL_COORDINATE_SYSTEM") {
                this.complete = true;
                this.coordinateSystem.isValid = false;
                // Reject line
                return false;
            }
            else {
                this.state++;
            }
        }
        return true;
    };
    CoordinateSystemPusher.prototype.pushData = function (line) {
        if (isDataLine(line)) {
            if (line !== "END_ORIGINAL_COORDINATE_SYSTEM") {
                var index = line.indexOf(" ");
                if (index > 0) {
                    var name = line.substring(0, index);
                    var rest = line.substring(index).trim();
                    var mapper = this.coordinateSystem.typeMap[name] ? this.coordinateSystem.typeMap[name] : function (val) { return val; };
                    this.coordinateSystem[name] = mapper(rest);
                }
            }
            else {
                this.coordinateSystem.typeMap = null;
                this.complete = true;
            }
        }
        return true;
    };
    return CoordinateSystemPusher;
}(StatePusher));

function flowThru(val) {
    return val;
}

var Logger = (function () {
    function Logger() {
    }
    Logger.noop = function () { };

    Object.defineProperty(Logger, "level", {
        set: function (value) {
            var num = parseInt(value);
            num = num === NaN ? 0 : num;
            if (!Logger._broken) {
                Logger.log = console.log;
                try {
                    Logger.log("Setting log level");
                }
                catch (e) {
                    Logger._broken = true;
                }
            }
            if (Logger._broken) {
                Logger.log = num >= 64 ? function (main) { console.log(main); } : Logger.noop;
                Logger.info = num >= 32 ? function (main) { console.info(main); } : Logger.noop;
                Logger.warn = num >= 16 ? function (main) { console.warn(main); } : Logger.noop;
                Logger.log = num >= 8 ? function (main) { console.log(main); } : Logger.noop;
            }
            else {
                // We get to keep line numbers if we do it this way.
                Logger.log = num >= 64 ? console.log : Logger.noop;
                Logger.info = num >= 32 ? console.info : Logger.noop;
                Logger.warn = num >= 16 ? console.warn : Logger.noop;
                Logger.error = num >= 8 ? console.error : Logger.noop;
            }
        },
        enumerable: true,
        configurable: true
    });
    return Logger;
}());
Logger.LOG_ALL = 64;
Logger.LOG_INFO = 32;
Logger.LOG_WARN = 16;
Logger.LOG_ERROR = 8;
Logger.LOG_NOTHING = 0;
Logger._broken = false;
Logger.log = Logger.noop;
Logger.error = Logger.noop;
Logger.info = Logger.noop;
Logger.warn = Logger.noop;

function toBool(val) {
    return "true" === val;
}

function toColor(val) {
    if (val) {
        var parts = val.trim().split(/\s+/g);
        if (parts.length === 1) {
            if (parts[0].indexOf("#") === 0) {
                return parseInt("0x" + parts[0].substring(1));
            }
        }
        return parseFloat(parts[0]) * 255 * 256 * 256 + parseFloat(parts[1]) * 255 * 256 + parseFloat(parts[2]) * 255;
    }
    return null;
}

var Header = (function () {
    function Header() {
        this.values = {};
        this.typeMap = {
            ivolmap: toBool,
            imap: toBool,
            parts: toBool,
            mesh: toBool,
            cn: toBool,
            border: toBool,
            "*solid*color": toColor
        };
    }
    return Header;
}());

var HeaderPusher = (function (_super) {
    __extends(HeaderPusher, _super);
    function HeaderPusher() {
        var _this = _super.call(this) || this;
        _this.header = new Header();
        return _this;
    }
    Object.defineProperty(HeaderPusher.prototype, "obj", {
        get: function () {
            return this.header;
        },
        enumerable: true,
        configurable: true
    });
    HeaderPusher.prototype.push = function (line) {
        if (!isDataLine(line)) {
            return true;
        }
        line = line.trim();
        if (line.indexOf("}") === 0) {
            this.postLoad();
        }
        else {
            var parts = line.split(":");
            if (parts.length === 2) {
                var mapper = this.header.typeMap[parts[0]];
                mapper = mapper ? mapper : flowThru;
                this.header.values[parts[0]] = mapper(parts[1]);
            }
            else {
                Logger.warn("That doesn't look like a pair: " + line);
            }
        }
        return true;
    };
    HeaderPusher.prototype.postLoad = function () {
        this.complete = true;
        var header = this.header;
        header.name = header.values["name"];
        header.solidColor = header.values["*solid*color"];
        header.solidColor = header.solidColor ? header.solidColor : 0xeeeeee;
        header.typeMap = null;
    };
    return HeaderPusher;
}(Pusher));

var TSurfPusher = (function (_super) {
    __extends(TSurfPusher, _super);
    /**
     * We come in here on the next line
     */
    function TSurfPusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.tsurf = new TSurf();
        _this.zSign = 1;
        _this.readTface = false;
        _this.verticesBuffer = [];
        _this.facesBuffer = [];
        _this.bordersBuffer = [];
        _this.bstonesBuffer = [];
        return _this;
    }
    Object.defineProperty(TSurfPusher.prototype, "obj", {
        get: function () {
            return this.tsurf;
        },
        enumerable: true,
        configurable: true
    });
    TSurfPusher.prototype.push = function (line) {
        if (this.complete) {
            throw new Error("Pushed line to completed tsurf pusher");
        }
        switch (this.state) {
            case 0:
                return this.waitForHead(line);
            case 1:
                return this.loadHeader(line);
            case 2:
                return this.loadCs(line);
            case 3:
                return this.waitForTface(line);
            case 4:
                return this.processToEnd(line);
        }
    };
    TSurfPusher.prototype.waitForHead = function (line) {
        // Gobble up comments and blank lines
        if (line.startsWith("HEADER")) {
            if (line.indexOf("{") === -1) {
                this.complete = true;
            }
            else {
                this.headerPusher = new HeaderPusher();
            }
            this.state++;
        }
        return true;
    };
    TSurfPusher.prototype.loadHeader = function (line) {
        this.headerPusher.push(line);
        if (this.headerPusher.complete) {
            this.tsurf.header = this.headerPusher.obj;
            this.csPusher = new CoordinateSystemPusher();
            this.state++;
        }
        return true;
    };
    TSurfPusher.prototype.loadCs = function (line) {
        this.csPusher.push(line);
        if (this.csPusher.complete) {
            if (this.csPusher.obj.isValid) {
                this.tsurf.coordinateSystem = this.csPusher.obj;
                this.zSign = this.tsurf.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
            }
            this.state++;
            this.dispatchEvent(new Event("header", this.tsurf));
        }
        return true;
    };
    TSurfPusher.prototype.waitForTface = function (line) {
        if (!line.indexOf("TFACE")) {
            this.state++;
        }
        return true;
    };
    TSurfPusher.prototype.processToEnd = function (line) {
        line = line.trim();
        if (line === "END") {
            this.complete = true;
            this.state = 99;
            this.flushVertices();
            this.flushFaces();
            this.flushBstones();
            this.flushBorders();
            this.tsurf.vertices = [];
            this.dispatchEvent(new Event("complete", {
                header: this.tsurf.header,
                coordinateSystem: this.tsurf.coordinateSystem,
                bbox: this.tsurf.bbox
            }));
        }
        else {
            var tsurf = this.tsurf;
            var index = line.indexOf("VRTX");
            if (index === 0 || index === 1) {
                var v = vertex(line, this.projectionFn, this.zSign);
                tsurf.vertices[v.index] = v.all;
                this.tsurf.bbox = BoxFactory.expand(this.tsurf.bbox, v.all);
                this.checkVertices(v.all); // Got to hang on to vertices for easy lookup
            }
            else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                var a = atom(line);
                this.checkVertices(tsurf.vertices[a.index] = tsurf.vertices[a.vertexId]); // Got to hang on to vertices for easy lookup
            }
            else if (line.indexOf("TRGL") === 0) {
                var next = face(line).abc;
                FaceFactory.computeNormal(next, this.tsurf.vertices);
                // tsurf.faces.push(next); // We don't need faces anymore now that we are event driven
                this.checkFaces(next);
            }
            else if (line.indexOf("BSTONE") === 0) {
                var bs = bstone(line);
                // tsurf.bstones.push(bs); // We don't need bstones anymore now that we are event driven
                this.checkBstones(bs);
            }
            else if (line.indexOf("BORDER") === 0) {
                var b = border(line);
                // tsurf.borders[b.id] = [b.vertices[0], b.vertices[1]]; // We don't need borders anymore now that we are event driven
                this.checkBorders([b.vertices[0], b.vertices[1]]);
            }
        }
        return true;
    };
    TSurfPusher.prototype.checkVertices = function (vertex$$1) {
        this.verticesBuffer.push(vertex$$1);
        if (this.verticesBuffer.length >= TSurfPusher.PAGE_SIZE) {
            this.flushVertices();
        }
    };
    TSurfPusher.prototype.flushVertices = function () {
        this.verticesBuffer = this.flush("vertices", this.verticesBuffer);
    };
    TSurfPusher.prototype.checkFaces = function (face$$1) {
        this.facesBuffer.push(face$$1);
        if (this.facesBuffer.length >= TSurfPusher.PAGE_SIZE) {
            this.flushFaces();
        }
    };
    TSurfPusher.prototype.flushFaces = function () {
        this.facesBuffer = this.flush("faces", this.facesBuffer);
    };
    TSurfPusher.prototype.checkBorders = function (face$$1) {
        this.bordersBuffer.push(face$$1);
        if (this.bordersBuffer.length >= TSurfPusher.PAGE_SIZE) {
            this.flushBorders();
        }
    };
    TSurfPusher.prototype.flushBorders = function () {
        this.bordersBuffer = this.flush("borders", this.bordersBuffer);
    };
    TSurfPusher.prototype.checkBstones = function (face$$1) {
        this.bstonesBuffer.push(face$$1);
        if (this.bstonesBuffer.length >= TSurfPusher.PAGE_SIZE) {
            this.flushBstones();
        }
    };
    TSurfPusher.prototype.flushBstones = function () {
        this.bstonesBuffer = this.flush("bstones", this.bstonesBuffer);
    };
    TSurfPusher.prototype.flush = function (name, arr) {
        if (arr.length) {
            this.dispatchEvent(new Event(name, arr));
        }
        return [];
    };
    return TSurfPusher;
}(StatePusher));
TSurfPusher.PAGE_SIZE = 64 * 1024;

function segment(seg) {
    var parts = seg.split(/\s+/g);
    return [
        parseInt(parts[1]) - 1,
        parseInt(parts[2]) - 1
    ];
}

var PLineHeader = (function (_super) {
    __extends(PLineHeader, _super);
    function PLineHeader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PLineHeader;
}(Header));

var PLineHeaderPusher = (function (_super) {
    __extends(PLineHeaderPusher, _super);
    function PLineHeaderPusher() {
        return _super.call(this) || this;
    }
    Object.defineProperty(PLineHeaderPusher.prototype, "obj", {
        get: function () {
            return this.plineHeader;
        },
        enumerable: true,
        configurable: true
    });
    PLineHeaderPusher.prototype.push = function (line) {
        var accepted = _super.prototype.push.call(this, line);
        if (this.complete) {
            this.complete = true;
            this.plineHeader = Object.assign(new PLineHeader(), this.header);
            this.plineHeader.typeMap = null;
            this.plineHeader.paintedVariable = this.plineHeader.values["*painted*variable"];
            var color = this.plineHeader.values["*line*color"];
            this.plineHeader.color = color ? toColor(color) : 0x0000ff;
        }
        return accepted;
    };
    return PLineHeaderPusher;
}(HeaderPusher));

var PLine = (function (_super) {
    __extends(PLine, _super);
    function PLine() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "PLine";
        _this.vertices = [];
        _this.lines = [];
        return _this;
    }
    return PLine;
}(Type));

var PLinePusher = (function (_super) {
    __extends(PLinePusher, _super);
    /**
     * We come in here on the next line
     */
    function PLinePusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.pline = new PLine();
        _this.verticesBuffer = [];
        _this.segmentsBuffer = [];
        return _this;
    }
    Object.defineProperty(PLinePusher.prototype, "obj", {
        get: function () {
            return this.pline;
        },
        enumerable: true,
        configurable: true
    });
    PLinePusher.prototype.push = function (line) {
        if (this.complete) {
            throw new Error("Pushed line to completed tsolid pusher");
        }
        switch (this.state) {
            case 0:
                return this.expectHeader(line);
            case 1:
                return this.pushHeader(line);
            case 2:
                return this.pushCs(line);
            case 3:
                return this.expectIline(line);
            case 4:
                return this.pushData(line);
        }
        return true;
    };
    PLinePusher.prototype.expectHeader = function (line) {
        line = line.trim();
        if (!line.startsWith("HEADER")) {
            return true;
        }
        if (!line || line.indexOf("{") === -1) {
            this.complete = true;
            return true;
        }
        this.child = new PLineHeaderPusher();
        this.state++;
        return true;
    };
    PLinePusher.prototype.pushHeader = function (line) {
        var accepted = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            this.pline.header = this.child.obj;
            this.child = new CoordinateSystemPusher();
        }
        return accepted;
    };
    PLinePusher.prototype.pushCs = function (line) {
        var response = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            if (this.child.isValid) {
                this.pline.coordinateSystem = this.child.obj;
                this.zSign = this.pline.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
            }
            this.dispatchEvent(new Event("header", this.pline));
        }
        return response;
    };
    PLinePusher.prototype.expectIline = function (line) {
        if (line.startsWith("ILINE")) {
            this.state++;
        }
        return true;
    };
    PLinePusher.prototype.pushData = function (line) {
        if (line === void 0) { line = ""; }
        line = line.trim();
        if (!line) {
            return true;
        }
        var pline = this.pline;
        if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
            var v = vertex(line, this.projectionFn, this.zSign);
            this.verticesBuffer[v.index] = v.all;
            pline.bbox = BoxFactory.expand(pline.bbox, v.all);
        }
        else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
            var a = atom(line);
            var v = this.verticesBuffer[a.vertexId];
            this.verticesBuffer[a.index] = v;
        }
        else if (line.indexOf("SEG") === 0) {
            var seg = segment(line);
            this.segmentsBuffer.push(this.verticesBuffer[seg[0]]);
            this.segmentsBuffer.push(this.verticesBuffer[seg[1]]);
            this.checkSegments();
        }
        else if (line.indexOf("ILINE") === 0 || line.indexOf("END") === 0) {
            this.complete = line.indexOf("END") === 0;
            // The segments never go backwards and we are using the index.
            this.verticesBuffer = [];
            if (this.complete) {
                this.flushSegments();
                this.dispatchEvent(new Event("complete", {
                    header: pline.header,
                    coordinateSystem: pline.coordinateSystem,
                    bbox: pline.bbox
                }));
            }
        }
        return true;
    };
    PLinePusher.prototype.checkSegments = function () {
        if (this.segmentsBuffer.length >= PLinePusher.PAGE_SIZE) {
            this.flushSegments();
        }
    };
    PLinePusher.prototype.flushSegments = function () {
        // They are just pairs of vertices, nothing special
        this.segmentsBuffer = this.flush("vertices", this.segmentsBuffer);
    };
    PLinePusher.prototype.flush = function (name, arr) {
        if (arr.length) {
            this.dispatchEvent(new Event(name, arr));
        }
        return [];
    };
    return PLinePusher;
}(StatePusher));
PLinePusher.PAGE_SIZE = 32 * 1024;

var TSolid = (function (_super) {
    __extends(TSolid, _super);
    function TSolid() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "TSolid";
        _this.vertices = [];
        _this.tetras = [];
        return _this;
    }
    return TSolid;
}(Type));

function tetra(tetra) {
    var parts = tetra.split(/\s+/g);
    return [
        parseInt(parts[1]),
        parseInt(parts[2]),
        parseInt(parts[3]),
        parseInt(parts[4])
    ];
}

var TSolidPusher = (function (_super) {
    __extends(TSolidPusher, _super);
    function TSolidPusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.tsolid = new TSolid();
        return _this;
    }
    Object.defineProperty(TSolidPusher.prototype, "obj", {
        get: function () {
            return this.tsolid;
        },
        enumerable: true,
        configurable: true
    });
    TSolidPusher.prototype.push = function (line) {
        if (this.complete) {
            throw new Error("Pushed line to completed tsolid pusher");
        }
        switch (this.state) {
            case 0:
                return this.expectHeader(line);
            case 1:
                return this.pushHeader(line);
            case 2:
                return this.pushCs(line);
            case 3:
                return this.expectTvolume(line);
            case 4:
                return this.pushData(line);
        }
        return true;
    };
    TSolidPusher.prototype.expectHeader = function (line) {
        if (line.startsWith("HEADER")) {
            this.child = new HeaderPusher();
            this.state++;
        }
        return true;
    };
    TSolidPusher.prototype.pushHeader = function (line) {
        var response = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            this.tsolid.header = this.child.obj;
            this.child = new CoordinateSystemPusher();
        }
        return response;
    };
    TSolidPusher.prototype.pushCs = function (line) {
        var response = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            this.tsolid.coordinateSystem = this.child.obj;
            this.zSign = this.tsolid.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
        }
        return response;
    };
    TSolidPusher.prototype.expectTvolume = function (line) {
        if (line.startsWith("TVOLUME")) {
            this.state++;
        }
        return true;
    };
    TSolidPusher.prototype.pushData = function (line) {
        line = line.trim();
        if (line === "END") {
            if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
                var v = vertex(line, this.projectionFn, this.zSign);
                this.tsolid.vertices[v.index] = v.all;
            }
            else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                var a = atom(line);
                this.tsolid.vertices[a.index] = this.tsolid.vertices[a.vertexId];
            }
            else if (line.indexOf("TETRA") === 0) {
                this.tsolid.tetras.push(tetra(line));
            }
        }
        else {
            this.complete = true;
        }
        return true;
    };
    return TSolidPusher;
}(StatePusher));

var VSet = (function (_super) {
    __extends(VSet, _super);
    function VSet() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "VSet";
        _this.vertices = [];
        return _this;
    }
    return VSet;
}(Type));

var VSetHeader = (function (_super) {
    __extends(VSetHeader, _super);
    function VSetHeader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VSetHeader;
}(Header));

var VSetHeaderPusher = (function (_super) {
    __extends(VSetHeaderPusher, _super);
    function VSetHeaderPusher() {
        return _super.call(this) || this;
    }
    Object.defineProperty(VSetHeaderPusher.prototype, "obj", {
        get: function () {
            return this.vsetHeader;
        },
        enumerable: true,
        configurable: true
    });
    VSetHeaderPusher.prototype.push = function (line) {
        var accepted = _super.prototype.push.call(this, line);
        if (this.complete) {
            this.complete = true;
            this.vsetHeader = Object.assign(new VSetHeader(), this.header);
            this.vsetHeader.color = toColor(this.vsetHeader.values["*atoms*color"]);
        }
        return accepted;
    };
    return VSetHeaderPusher;
}(HeaderPusher));

var VSetPusher = (function (_super) {
    __extends(VSetPusher, _super);
    /**
     * We come in here on the next line
     */
    function VSetPusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.verticesBuffer = [];
        _this.vset = new VSet();
        return _this;
    }
    Object.defineProperty(VSetPusher.prototype, "obj", {
        get: function () {
            return this.vset;
        },
        enumerable: true,
        configurable: true
    });
    VSetPusher.prototype.push = function (line) {
        if (this.complete) {
            throw new Error("Pushed line to completed tsolid pusher");
        }
        switch (this.state) {
            case 0:
                return this.expectHeader(line);
            case 1:
                return this.pushHeader(line);
            case 2:
                return this.pushCs(line);
            case 3:
                return this.pushData(line);
        }
        return true;
    };
    VSetPusher.prototype.expectHeader = function (line) {
        if (line === void 0) { line = ""; }
        line = line.trim();
        if (!line.startsWith("HEADER")) {
            return true;
        }
        if (line.indexOf("{") === -1) {
            this.complete = true;
        }
        this.child = new VSetHeaderPusher();
        this.state++;
        return true;
    };
    VSetPusher.prototype.pushHeader = function (line) {
        if (line === void 0) { line = ""; }
        var accepted = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            this.vset.header = this.child.obj;
            this.child = new CoordinateSystemPusher();
            this.zSign = 1;
            this.dispatchEvent(new Event("header", this.vset));
        }
        return accepted;
    };
    VSetPusher.prototype.pushCs = function (line) {
        var response = this.child.push(line);
        if (this.child.complete) {
            this.state++;
            this.vset.coordinateSystem = this.child.obj;
            this.zSign = this.vset.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
        }
        return response;
    };
    VSetPusher.prototype.pushData = function (line) {
        if (line === void 0) { line = ""; }
        line = line.trim();
        if (line) {
            if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
                var v = vertex(line, this.projectionFn, this.zSign);
                this.vset.bbox = BoxFactory.expand(this.vset.bbox, v.all);
                this.checkVertices(v.all);
            }
            else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
                var a = atom(line);
                this.checkVertices(this.vset.vertices[a.vertexId]);
            }
            else if (line.startsWith("END") && !line.startsWith("END_")) {
                this.complete = true;
                this.flushVertices();
                this.dispatchEvent(new Event("complete", {
                    header: this.vset.header,
                    coordinateSystem: this.vset.coordinateSystem,
                    bbox: this.vset.bbox
                }));
            }
        }
        return true;
    };
    VSetPusher.prototype.checkVertices = function (vertex$$1) {
        this.verticesBuffer.push(vertex$$1);
        if (this.verticesBuffer.length >= VSetPusher.PAGE_SIZE) {
            this.flushVertices();
        }
    };
    VSetPusher.prototype.flushVertices = function () {
        this.verticesBuffer = this.flush("vertices", this.verticesBuffer);
    };
    VSetPusher.prototype.flush = function (name, arr) {
        if (arr.length) {
            this.dispatchEvent(new Event(name, arr));
        }
        return [];
    };
    return VSetPusher;
}(StatePusher));
VSetPusher.PAGE_SIZE = 64 * 1024;

var Unknown = (function (_super) {
    __extends(Unknown, _super);
    function Unknown() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "Unknown";
        return _this;
    }
    return Unknown;
}(Type));

var UnknownPusher = (function (_super) {
    __extends(UnknownPusher, _super);
    /**
     * We come in here on the next line
     */
    function UnknownPusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.unknown = new Unknown();
        return _this;
    }
    Object.defineProperty(UnknownPusher.prototype, "obj", {
        get: function () {
            return this.unknown;
        },
        enumerable: true,
        configurable: true
    });
    UnknownPusher.prototype.push = function (line) {
        if (line.trim() === "END") {
            this.complete = true;
        }
        return true;
    };
    return UnknownPusher;
}(Pusher));

var TypeFactory = (function () {
    function TypeFactory() {
        this.isValid = false;
    }
    return TypeFactory;
}());

var TypeFactoryPusher = (function (_super) {
    __extends(TypeFactoryPusher, _super);
    function TypeFactoryPusher(projectionFn) {
        var _this = _super.call(this) || this;
        _this.projectionFn = projectionFn;
        _this.typeFactory = new TypeFactory();
        return _this;
    }
    Object.defineProperty(TypeFactoryPusher.prototype, "obj", {
        get: function () {
            return this.type.obj;
        },
        enumerable: true,
        configurable: true
    });
    TypeFactoryPusher.prototype.push = function (line) {
        var accepted = true;
        if (this.type) {
            accepted = this.type.push(line);
            this.complete = this.type.complete;
        }
        else {
            accepted = this.create(line);
        }
        return accepted;
    };
    TypeFactoryPusher.prototype.create = function (line) {
        var _this = this;
        line = line.trim();
        var parts = line.split(/\s+/g);
        this.typeFactory.isValid = parts.length === 3
            && parts[0] === "GOCAD"
            && (parts[2] === "1.0" || parts[2] === "1");
        if (this.typeFactory.isValid) {
            this.typeFactory.version = parts[2];
            if (parts[1] === "TSurf") {
                this.type = new TSurfPusher(this.projectionFn);
            }
            else if (parts[1] === "PLine") {
                this.type = new PLinePusher(this.projectionFn);
            }
            else if (parts[1] === "TSolid") {
                this.type = new TSolidPusher(this.projectionFn);
            }
            else if (parts[1] === "VSet") {
                this.type = new VSetPusher(this.projectionFn);
            }
            else {
                this.type = new UnknownPusher(this.projectionFn);
            }
        }
        var self = this;
        EventNames.names.forEach(function (name) { return _this.type.addEventListener(name, eventHandler); });
        return this.typeFactory.isValid;
        function eventHandler(event) {
            Logger.log("TFP: " + event.type);
            self.dispatchEvent(event);
        }
    };
    return TypeFactoryPusher;
}(Pusher));

var Document = (function () {
    function Document() {
        this.types = [];
    }
    return Document;
}());

var GocadDocument = (function (_super) {
    __extends(GocadDocument, _super);
    function GocadDocument() {
        var _this = _super.call(this) || this;
        _this.types = [];
        return _this;
    }
    return GocadDocument;
}(Document));

var DocumentPusher = (function (_super) {
    __extends(DocumentPusher, _super);
    function DocumentPusher(options, proj4) {
        var _this = _super.call(this) || this;
        _this.proj4 = proj4;
        _this.eventHandler = function (event) {
            Logger.log("DP: " + event.type);
            _this.dispatchEvent(event);
        };
        // They can pick a projection but if the app hasn't loaded the proj4 library we don't do anything as well
        if (options && options.from && options.to && options.from !== options.to && proj4) {
            proj4.defs("EPSG:3112", "+proj=lcc +lat_1=-18 +lat_2=-36 +lat_0=0 +lon_0=134 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
            _this.projectionFn = function reproject(from, to) {
                return function (coords) {
                    return proj4(from, to, [coords[0], coords[1]]);
                };
            }(options.from, options.to);
        }
        else {
            _this.projectionFn = passThru;
        }
        _this.document = new GocadDocument();
        _this.typefactorypusher = _this.createTypeFactoryPusher(_this.projectionFn);
        return _this;
    }
    Object.defineProperty(DocumentPusher.prototype, "obj", {
        get: function () {
            return this.document;
        },
        enumerable: true,
        configurable: true
    });
    DocumentPusher.prototype.push = function (line) {
        var consumed = this.typefactorypusher.push(line);
        // Well behaved children will have changed state when not consuming so *shouldn't* get in an infinite loop.
        if (!consumed) {
            Logger.log("NOT PUSHED: " + line);
            this.push(line);
            // Just in case they don't behave we'll swallow it.
            return true;
        }
        if (this.typefactorypusher.complete) {
            this.complete = true;
            this.document.types.push(this.typefactorypusher.obj);
            this.destroyTypeFactoryPusher(this.typefactorypusher);
            this.typefactorypusher = this.createTypeFactoryPusher(this.projectionFn);
        }
        return true;
    };
    DocumentPusher.prototype.createTypeFactoryPusher = function (projectionFn) {
        var _this = this;
        var self = this;
        var pusher = new TypeFactoryPusher(projectionFn);
        EventNames.names.forEach(function (name) {
            pusher.addEventListener(name, _this.eventHandler);
        });
        return pusher;
    };
    DocumentPusher.prototype.destroyTypeFactoryPusher = function (typefactorypusher) {
        var _this = this;
        EventNames.names.forEach(function (name) {
            typefactorypusher.removeEventListener(name, _this.eventHandler);
        });
    };
    return DocumentPusher;
}(Pusher));
function passThru(coords) {
    return coords;
}

var LinesToLinePusher = (function () {
    function LinesToLinePusher(callback) {
        this.callback = callback;
    }
    LinesToLinePusher.prototype.receiver = function (lines) {
        var _this = this;
        lines.forEach(function (line) {
            _this.callback(line);
        });
    };
    return LinesToLinePusher;
}());

var HttpPusher = (function () {
    function HttpPusher(url, callback) {
        this.url = url;
        this.callback = callback;
    }
    HttpPusher.prototype.start = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var self = _this;
            var get = new XMLHttpRequest();
            var index = 0;
            var pageNo = 0;
            var lineBuffer = [];
            var handleData = function () {
                if (get.readyState !== null && (get.readyState < 3 || get.status !== 200)) {
                    return;
                }
                var text = get.responseText;
                var totalLength = text.length;
                for (var i = index; i < totalLength; i++) {
                    var char = text[i];
                    if (char === "\r") {
                        continue;
                    }
                    if (char === "\n") {
                        var line = lineBuffer.join("");
                        lineBuffer = [];
                        self.callback(line);
                        continue;
                    }
                    lineBuffer.push(char);
                }
                index = totalLength;
                // Logger.log("Handling data: " + ++pageNo + ", size: " + text.length + ", state: " + get.readyState);
                if (get.readyState === 4) {
                    resolve(null);
                }
            };
            get.onreadystatechange = handleData;
            get.open("get", _this.url);
            get.send();
        });
    };
    return HttpPusher;
}());

var LinesPagedPusher = (function () {
    function LinesPagedPusher(file, options, callback) {
        this.file = file;
        this.callback = callback;
        this.blockSize = 16 * 1024; // A bit at a time should be harmless
        this.file = file;
        this.length = file.size;
        this.pageNo = -1;
        this.index = 0;
        this.blockSize = options.blockSize ? options.blockSize : this.blockSize;
        this.reader;
        this.lineBuffer = [];
        this.reader = new FileReader();
    }
    LinesPagedPusher.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, lines, lineResult, _a, group;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.read()];
                    case 1:
                        result = _b.sent();
                        lines = [];
                        _b.label = 2;
                    case 2:
                        if (!result) return [3 /*break*/, 8];
                        lineResult = this.next();
                        _a = lineResult.state;
                        switch (_a) {
                            case "more": return [3 /*break*/, 3];
                            case "line": return [3 /*break*/, 5];
                            case "complete": return [3 /*break*/, 6];
                        }
                        return [3 /*break*/, 7];
                    case 3:
                        group = lines;
                        lines = [];
                        try {
                            this.callback(group);
                        }
                        catch (e) {
                            Logger.error(e);
                            Logger.error("Someone died. Continue on.\n\n" + group.join("\n").substr(0, 2000));
                        }
                        return [4 /*yield*/, this.read()];
                    case 4:
                        result = _b.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        lines.push(lineResult.line);
                        return [3 /*break*/, 7];
                    case 6:
                        lines.push(lineResult.line);
                        if (lines.length) {
                            try {
                                this.callback(lines);
                            }
                            catch (e) {
                                Logger.error(e);
                                Logger.error("Someone died. Continue on.\n\n" + lines.join("\n").substr(0, 2000));
                            }
                        }
                        result = false;
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 2];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    LinesPagedPusher.prototype.read = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var self, start;
            return __generator(this, function (_a) {
                this.pageNo++;
                this.index = 0;
                self = this;
                start = this.pageNo * this.blockSize;
                Logger.log("Block size: " + this.blockSize + ", file size: " + this.length);
                return [2 /*return*/, new Promise(function (resolve) {
                        if (start >= _this.length) {
                            resolve(false);
                            return;
                        }
                        try {
                            self.reader.onloadend = function (evt) {
                                Logger.log("We have loaded with ready state = " + evt.target["readyState"]);
                                if (evt.target["readyState"] === FileReader.prototype.DONE) {
                                    Logger.log("Reading page " + self.pageNo);
                                    self.buffer = evt.target["result"];
                                    resolve(_this.hasMore());
                                }
                            };
                            self.reader.onerror = function (evt) {
                                Logger.log("What do you mean, error");
                            };
                            var blob = self.file.slice(start, start + self.blockSize);
                            self.reader.readAsText(blob);
                        }
                        catch (e) {
                            Logger.log(e);
                        }
                    })];
            });
        });
    };
    LinesPagedPusher.prototype.hasMore = function () {
        return this.index + this.blockSize * this.pageNo < this.length - 1;
    };
    LinesPagedPusher.prototype.next = function () {
        while (this.hasMore()) {
            if (!this.buffer || this.index >= this.blockSize) {
                return { state: "more" };
            }
            var char = this.buffer[this.index++];
            if (char === "\r") {
                continue;
            }
            if (char === "\n") {
                break;
            }
            this.lineBuffer.push(char);
        }
        var line = this.lineBuffer.join("");
        this.lineBuffer = [];
        return {
            state: this.hasMore() ? "line" : "complete",
            line: line
        };
    };
    return LinesPagedPusher;
}());

// Rollup the libs as used by the web workers.
// These are basically your domain objects, utilities, readers and transformers

/**
 * Load borders from a TSurf as a seperate entity
 */
function loadBorders(tsurf) {
    var segments = new THREE.Geometry();
    tsurf.borders.forEach(function (seg) {
        var vertex = tsurf.vertices[seg[0]];
        segments.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
        vertex = tsurf.vertices[seg[1]];
        segments.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
    });
    if (segments.vertices.length) {
        segments.computeBoundingBox();
        return new THREE.LineSegments(segments, new THREE.LineBasicMaterial({
            linewidth: 10,
            color: 0xff00ff
        }));
    }
    return null;
}

function loadBstones(tsurf) {
    var geometry = new THREE.Geometry();
    tsurf.bstones.forEach(function (bstone) {
        var xyz = tsurf.vertices[bstone];
        if (xyz) {
            var vertex = new THREE.Vector3(xyz[0], xyz[1], xyz[2]);
            geometry.vertices.push(vertex);
        }
    });
    if (geometry.vertices.length) {
        geometry.computeBoundingBox();
        var material = new THREE.PointsMaterial({ size: 4096 * 4 });
        return new THREE.Points(geometry, material);
    }
    return null;
}

var CameraPositioner = (function () {
    function CameraPositioner() {
    }
    CameraPositioner.prototype.onCreate = function (z, radius, center) {
        return {
            far: this.far(z, radius, center),
            near: this.near(z, radius, center),
            up: this.up(z, radius, center),
            position: this.position(z, radius, center),
            lookAt: this.lookAt(z, radius, center)
        };
    };
    CameraPositioner.prototype.onResize = function (z, radius, center) {
        return {
            far: this.far(z, radius, center),
            near: this.near(z, radius, center),
            lookAt: this.lookAt(z, radius, center)
        };
    };
    CameraPositioner.prototype.onExtend = function (z, radius, center) {
        return this.onCreate(z, radius, center);
    };
    CameraPositioner.prototype.lookAt = function (z, radius, center) {
        return {
            x: center.x,
            y: center.y,
            z: center.z
        };
    };
    CameraPositioner.prototype.position = function (z, radius, center) {
        return {
            x: center.x,
            y: center.y - 3 * radius,
            z: center.z + radius
        };
    };
    CameraPositioner.prototype.up = function (z, radius, center) {
        return {
            x: 0,
            y: 0,
            z: 1
        };
    };
    CameraPositioner.prototype.near = function (z, radius, center) {
        return radius * 0.01;
    };
    CameraPositioner.prototype.far = function (z, radius, center) {
        return z * 250;
    };
    return CameraPositioner;
}());

function deepMerge(target, source) {
    var array = Array.isArray(source);
    var dst = array && [] || {};
    if (array) {
        var dest_1 = dst;
        target = target || [];
        dest_1 = dest_1.concat(target);
        source.forEach(function (item, i) {
            if (typeof dest_1[i] === "undefined") {
                dest_1[i] = item;
            }
            else if (typeof item === "object") {
                dest_1[i] = deepMerge(target[i], item);
            }
            else {
                if (target.indexOf(item) === -1) {
                    dest_1.push(item);
                }
            }
        });
    }
    else {
        if (target && typeof target === "object") {
            Object.keys(target).forEach(function (key) {
                dst[key] = target[key];
            });
        }
        Object.keys(source).forEach(function (key) {
            if (typeof source[key] !== "object" || !source[key]) {
                dst[key] = source[key];
            }
            else {
                if (!target[key]) {
                    dst[key] = source[key];
                }
                else {
                    dst[key] = deepMerge(target[key], source[key]);
                }
            }
        });
    }
    return dst;
}

/**
 *  Resizer
 *
 * Sadly it relies on the perspectve camera.
 *
 * Make sure you destroy on killing the camera or renderer.
 * It would have been nice to trigger off an event but I couldn't see one to grab.
 */
var Resizer = (function () {
    function Resizer(renderer, camera, container) {
        if (container === void 0) { container = window; }
        var _this = this;
        this.renderer = renderer;
        this.camera = camera;
        this.container = container;
        this.update = function () {
            var size = _this.container.getBoundingClientRect();
            _this.renderer.setSize(size.width, size.height);
            _this.camera.aspect = size.width / size.height;
            _this.camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", this.update, false);
    }
    Resizer.prototype.resize = function () {
        this.update();
    };
    Resizer.prototype.destroy = function () {
        window.removeEventListener("resize", this.update);
    };
    return Resizer;
}());

/// <reference path="../external.d.ts" />
var World = (function () {
    function World(container, options) {
        if (options === void 0) { options = {}; }
        this.options = {
            camera: {
                fov: 45,
                near: 0.1,
                far: 500000,
                position: {
                    x: -30,
                    y: 40,
                    z: 30
                },
                up: {
                    x: 0,
                    y: 1,
                    z: 0
                }
            },
            lights: {
                ambient: {
                    color: 0xcccccc
                },
                directional: {
                    color: 0x888888,
                    center: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    position: {
                        dx: 500,
                        dy: 100,
                        dz: -300
                    }
                }
            },
            axisHelper: {
                on: true,
                size: 20
            }
        };
        this.lights = [];
        this.options = deepMerge(this.options, options);
        var rect = document.body.getBoundingClientRect();
        if (typeof container === "string") {
            this.container = document.getElementById("" + container);
        }
        else {
            this.container = container;
        }
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({ clearColor: 0xff0000 });
        this.renderer.setSize(rect.width, rect.height);
        var cam = this.options.camera;
        this.camera = new THREE.PerspectiveCamera(cam.fov, rect.width / rect.height, cam.near, cam.far);
        this.camera.up.set(cam.up.x, cam.up.y, cam.up.z);
        var pos = cam.position;
        this.camera.position.x = pos.x;
        this.camera.position.y = pos.y;
        this.camera.position.z = pos.z;
        if (options.camera.lookAt) {
            var la = options.camera.lookAt;
            this.lookAt = new THREE.Vector3(la.x, la.y, la.z);
        }
        else {
            this.lookAt = this.scene.position;
        }
        this.camera.lookAt(this.lookAt);
        this.container.appendChild(this.renderer.domElement);
        this.renderer.render(this.scene, this.camera);
        this.axisHelper(this.options.axisHelper.on);
        this.addLights();
        // this.addControls();
        this.addFlyControls();
        this.resizer = new Resizer(this.renderer, this.camera, this.container);
        var context = this;
        this.continueAnimation = true;
        this.resizer.resize();
        animate();
        function animate() {
            if (!context.continueAnimation)
                return;
            window.requestAnimationFrame(animate);
            // context.renderer.clear();
            context.camera.lookAt(context.lookAt);
            context.renderer.render(context.scene, context.camera);
            context.controls.update(0.02);
        }
    }
    World.prototype.destroy = function () {
        this.lights = [];
        this.axis = null;
        this.renderer.dispose();
        this.renderer = null;
        this.dataContainer.children.forEach(function (child) {
            child.geometry.dispose();
            child.material.dispose();
        });
        this.scene.remove(this.dataContainer);
        this.scene = null;
        this.camera = null;
        if (this.controls.dispose) {
            this.controls.dispose();
        }
        this.controls = null;
        this.resizer.destroy();
        this.resizer = null;
        while (this.container.lastChild)
            this.container.removeChild(this.container.lastChild);
        this.continueAnimation = false;
    };
    World.prototype.resize = function (options) {
        this.options = deepMerge(this.options, options ? options : {});
        // Clear and set axishelper
        var state = this.options.axisHelper.on;
        this.axisHelper(false);
        this.axisHelper(state);
        this.updateLights();
        var la = options.camera.lookAt;
        this.lookAt = new THREE.Vector3(la.x, la.y, la.z);
        this.camera.far = options.camera.far;
        this.camera.near = options.camera.near;
        this.camera.lookAt(this.lookAt);
    };
    World.prototype.update = function (options) {
        this.options = deepMerge(this.options, options ? options : {});
        var cam = this.options.camera;
        this.camera.up.set(cam.up.x, cam.up.y, cam.up.z);
        var pos = cam.position;
        this.camera.position.x = pos.x;
        this.camera.position.y = pos.y;
        this.camera.position.z = pos.z;
        if (options.camera.lookAt) {
            var la = options.camera.lookAt;
            this.lookAt = new THREE.Vector3(la.x, la.y, la.z);
        }
        else {
            this.lookAt = this.scene.position;
        }
        this.camera.lookAt(this.lookAt);
        this.controls.movementSpeed = this.options.radius;
        // Clear and set axishelper
        var state = this.options.axisHelper.on;
        this.axisHelper(false);
        this.axisHelper(state);
        this.updateLights();
    };
    World.prototype.addLabels = function (scale) {
        var visible = true;
        if (this.labels) {
            visible = this.labels.visible;
            this.scene.remove(this.labels);
        }
        var container = this.labels = new THREE.Object3D();
        var pos = this.options.axisHelper.position;
        var offset = this.options.axisHelper.size;
        var labels = this.options.axisHelper.labels;
        var options = {
            fontsize: 54,
            backgroundColor: { r: 255, g: 200, b: 200, a: 0.7 }
        };
        var sprite = makeTextSprite(labels.x, options);
        if (sprite) {
            sprite.position.set(pos.x + offset, pos.y, pos.z);
            container.add(sprite);
        }
        options.backgroundColor = { r: 200, g: 255, b: 200, a: 0.7 };
        sprite = makeTextSprite(labels.y, options);
        if (sprite) {
            sprite.position.set(pos.x, pos.y + offset, pos.z);
            container.add(sprite);
        }
        options.backgroundColor = { r: 200, g: 200, b: 255, a: 0.7 };
        sprite = makeTextSprite(labels.z, options);
        if (sprite) {
            sprite.position.set(pos.x, pos.y, pos.z + offset);
            container.add(sprite);
        }
        this.scene.add(container);
        container.visible = visible;
        return container;
        function makeTextSprite(message, parameters) {
            // If we haven't got a message there is no point continuing
            if (!message) {
                return undefined;
            }
            var parms = deepMerge({
                fontface: "Arial",
                fontsize: 14,
                borderThickness: 4,
                borderColor: { r: 0, g: 0, b: 0, a: 1.0 },
                backgroundColor: { r: 255, g: 255, b: 255, a: 1.0 }
            }, parameters ? parameters : {});
            var canvas = document.createElement("canvas");
            canvas.width = 256;
            canvas.height = 128;
            var context = canvas.getContext("2d");
            context.font = parms.fontsize + "px " + parms.fontface;
            // get size data (height depends only on font size)
            var metrics = context.measureText(message);
            var textWidth = metrics.width;
            Logger.log(textWidth);
            // background color
            context.fillStyle = "rgba(" + parms.backgroundColor.r + "," + parms.backgroundColor.g + ","
                + parms.backgroundColor.b + "," + parms.backgroundColor.a + ")";
            // border color
            context.strokeStyle = "rgba(" + parms.borderColor.r + "," + parms.borderColor.g + ","
                + parms.borderColor.b + "," + parms.borderColor.a + ")";
            context.lineWidth = parms.borderThickness;
            roundRect(context, parms.borderThickness / 2, parms.borderThickness / 2, textWidth + parms.borderThickness, parms.fontsize * 1.4 + parms.borderThickness, 6);
            // 1.4 is extra height factor for text below baseline: g,j,p,q.
            // text color
            context.fillStyle = "rgba(0, 0, 0, 1.0)";
            context.fillText(message, parms.borderThickness, parms.fontsize + parms.borderThickness);
            // canvas contents will be used for a texture
            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            var spriteMaterial = new THREE.SpriteMaterial({
                map: texture
            });
            var sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(scale * 35, scale * 15, 1); // scale * 1);
            return sprite;
        }
        function roundRect(ctx, x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    };
    World.prototype.axisHelper = function (on) {
        if (this.axis) {
            if (!on) {
                this.scene.remove(this.axis);
                this.axis = null;
            }
        }
        else {
            if (on) {
                var options = this.options.axisHelper;
                this.axis = new THREE.AxisHelper(options.size);
                if (options.position) {
                    this.axis.position.set(options.position.x, options.position.y, options.position.z);
                    if (options.labels) {
                        var scale = options.size / 100;
                        this.addLabels(scale);
                    }
                }
                this.scene.add(this.axis);
            }
        }
        this.options.axisHelper.on = on;
    };
    World.prototype.addControls = function () {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.enableZoom = true;
        this.controls.userPanSpeed = 20000;
    };

    World.prototype.addFirstPersonControls = function () {
        this.controls = new THREE.FirstPersonControls(this.camera, this.renderer.domElement);
        // this.controls.movementSpeed = this.options.radius;
        // this.controls.domElement = this.container;
        // this.controls.rollSpeed = Math.PI * 24 * this.options.radius;
        // this.controls.autoForward = false;
        // this.controls.dragToLook = false;
    };

    World.prototype.addFlyControls = function () {
        this.controls = new THREE.FlyControls(this.camera, this.renderer.domElement);
        this.controls.movementSpeed = this.options.radius;
        this.controls.domElement = this.container;
        this.controls.rollSpeed = Math.PI * 24;
        this.controls.autoForward = false;
        this.controls.dragToLook = false;
    };

    World.prototype.addLights = function () {
        var data = this.options.lights;
        this.lights[0] = new THREE.AmbientLight(data.ambient.color);
        this.scene.add(this.lights[0]);
        var dir = data.directional;
        this.lights[1] = new THREE.DirectionalLight(dir.color);
        this.lights[1].position.set(dir.center.x + dir.position.dx, dir.center.y + dir.position.dy, dir.center.z + dir.position.dz);
        this.scene.add(this.lights[1]);
        this.lights[2] = new THREE.DirectionalLight(dir.color);
        this.lights[2].position.set(dir.center.x + dir.position.dx, dir.center.y + dir.position.dy, dir.center.z - dir.position.dz);
        this.scene.add(this.lights[2]);
    };

    World.prototype.updateLights = function () {
        this.scene.remove(this.lights[0]);
        this.scene.remove(this.lights[1]);
        this.scene.remove(this.lights[2]);
        this.addLights();
    };
    return World;
}());

var DefaultWorldFactory = (function (_super) {
    __extends(DefaultWorldFactory, _super);
    function DefaultWorldFactory(element) {
        var _this = _super.call(this) || this;
        _this.element = element;
        _this.state = {
            world: null,
            dataContainer: null,
            get isAllVisible() {
                if (this.state.world && this.state.world.scene) {
                    return !this.state.dataContainer.children.some(function (layer) {
                        return !layer.visible;
                    });
                }
            }
        };
        return _this;
    }
    DefaultWorldFactory.prototype.destroy = function () {
        if (this.state.world) {
            this.state.world.destroy();
            this.state.world = null;
            this.state.dataContainer = null;
            this.dispatchEvent({
                type: "objects.changed",
                objects: []
            });
        }
    };
    DefaultWorldFactory.prototype.remove = function (obj) {
        var result = false;
        if (this.state.dataContainer) {
            this.state.dataContainer.remove(obj);
            result = this.state.dataContainer.children.length > 0;
            if (!result) {
                this.destroy();
            }
            else {
                this.resize();
                this.dispatchEvent({
                    type: "objects.changed",
                    objects: this.state.dataContainer.children
                });
            }
        }
        return result;
    };
    DefaultWorldFactory.prototype.resize = function () {
        var box = new THREE.Box3().setFromObject(this.state.dataContainer);
        var center = box.getCenter();
        var radius = box.getBoundingSphere().radius;
        var z = radius * 2.5;
        var options = {
            radius: radius,
            axisHelper: {
                on: true,
                size: radius,
                position: {
                    x: center.x,
                    y: center.y,
                    z: center.z
                },
                labels: {
                    x: " East ",
                    y: " North ",
                    z: " Elevation "
                }
            },
            camera: {
                far: z * 250,
                near: radius * 0.01,
                lookAt: {
                    x: center.x,
                    y: center.y,
                    z: center.z
                }
            },
            lights: {
                directional: {
                    center: {
                        x: center.x,
                        y: center.y,
                        z: center.z
                    },
                    position: {
                        dx: radius,
                        dy: -radius,
                        dz: z
                    }
                }
            }
        };
        this.state.world.resize(options);
    };
    DefaultWorldFactory.prototype.show = function (data) {
        if (!this.state.dataContainer) {
            this.create(data);
        }
        else {
            this.extend(data);
        }
        this.dispatchEvent({
            type: "objects.changed",
            objects: this.state.dataContainer.children
        });
    };
    DefaultWorldFactory.prototype.create = function (data) {
        this.state.dataContainer = new THREE.Object3D();
        this.state.dataContainer.add(data);
        var box = new THREE.Box3().setFromObject(data);
        var center = box.getCenter();
        data.userData.center = center;
        var radius = box.getBoundingSphere().radius;
        var z = radius * 4;
        var options = {
            radius: radius,
            axisHelper: {
                on: true,
                size: radius,
                position: {
                    x: center.x,
                    y: center.y,
                    z: center.z
                },
                labels: {
                    x: " East ",
                    y: " North ",
                    z: " Elevation "
                }
            },
            camera: {
                far: z * 250,
                near: radius * 0.01,
                up: {
                    x: 0,
                    y: 0,
                    z: 1
                },
                position: {
                    x: center.x,
                    y: center.y - 3 * radius,
                    z: center.z + radius
                },
                lookAt: {
                    x: center.x,
                    y: center.y,
                    z: center.z
                }
            },
            lights: {
                directional: {
                    center: {
                        x: center.x,
                        y: center.y,
                        z: center.z
                    },
                    position: {
                        dx: radius,
                        dy: radius,
                        dz: z
                    }
                }
            }
        };
        if (this.state.world) {
            this.state.world.destroy();
        }
        this.state.world = new World(this.element, options);
        // window["world"] = state.world;
        this.add(this.state.dataContainer);
        this.dispatchEvent({
            type: "world.created",
            factory: this
        });
    };
    DefaultWorldFactory.prototype.getWorld = function () {
        return this.state.world;
    };
    DefaultWorldFactory.prototype.add = function (obj3d) {
        this.state.world.scene.add(obj3d);
        this.state.world.dataContainer = obj3d;
    };
    DefaultWorldFactory.prototype.extend = function (data) {
        var center = new THREE.Box3().setFromObject(data).getCenter();
        data.userData.center = center;
        this.state.dataContainer.add(data);
        var box = new THREE.Box3().setFromObject(this.state.dataContainer);
        center = box.getCenter();
        var radius = box.getBoundingSphere().radius;
        var z = radius * 4;
        var options = {
            radius: radius,
            axisHelper: {
                on: true,
                size: radius,
                position: {
                    x: center.x,
                    y: center.y,
                    z: center.z
                },
                labels: {
                    x: " East ",
                    y: " North ",
                    z: " Elevation "
                }
            },
            camera: {
                far: z * 250,
                near: radius * 0.01,
                up: {
                    x: 0,
                    y: 0,
                    z: 1
                },
                position: {
                    x: center.x,
                    y: center.y - 3 * radius,
                    z: center.z + radius
                },
                lookAt: {
                    x: center.x,
                    y: center.y,
                    z: center.z
                }
            },
            lights: {
                directional: {
                    center: {
                        x: center.x,
                        y: center.y,
                        z: center.z
                    },
                    position: {
                        dx: radius,
                        dy: -radius,
                        dz: z
                    }
                }
            }
        };
        this.state.world.update(options);
    };
    return DefaultWorldFactory;
}(THREE.EventDispatcher));

var WorldFactory = (function (_super) {
    __extends(WorldFactory, _super);
    function WorldFactory(element, options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.element = element;
        _this.state = {
            world: null,
            dataContainer: null,
            get isAllVisible() {
                if (this.state.world && this.state.world.scene) {
                    return !this.state.dataContainer.children.some(function (layer) {
                        return !layer.visible;
                    });
                }
            }
        };
        _this.options = {
            axisHelper: {
                on: true,
                labels: {
                    x: " East ",
                    y: " North ",
                    z: " Elevation "
                }
            }
        };
        _this.options = deepMerge(_this.options, options);
        _this.options.cameraPositioner = options.cameraPositioner ? options.cameraPositioner : new CameraPositioner();
        return _this;
    }
    WorldFactory.prototype.destroy = function () {
        if (this.state.world) {
            this.state.world.destroy();
            this.state.world = null;
            this.state.dataContainer = null;
            this.dispatchEvent({
                type: "objects.changed",
                objects: []
            });
        }
    };
    WorldFactory.prototype.remove = function (obj) {
        var result = false;
        if (this.state.dataContainer) {
            this.state.dataContainer.remove(obj);
            result = this.state.dataContainer.children.length > 0;
            if (!result) {
                this.destroy();
            }
            else {
                this.resize();
                this.dispatchEvent({
                    type: "objects.changed",
                    objects: this.state.dataContainer.children
                });
            }
        }
        return result;
    };
    WorldFactory.prototype.resize = function () {
        var box = new THREE.Box3().setFromObject(this.state.dataContainer);
        var center = box.getCenter();
        var radius = box.getBoundingSphere().radius;
        var z = radius * 2.5;
        var options = deepMerge({
            radius: radius,
            axisHelper: {
                on: true,
                size: radius,
                position: {
                    x: center.x,
                    y: center.y,
                    z: center.z
                }
            },
            camera: this.options.cameraPositioner.onResize(z, radius, center),
            lights: {
                directional: {
                    center: {
                        x: center.x,
                        y: center.y,
                        z: center.z
                    },
                    position: {
                        dx: radius,
                        dy: -radius,
                        dz: z
                    }
                }
            }
        }, this.options);
        this.state.world.resize(options);
    };
    WorldFactory.prototype.show = function (data) {
        if (!this.state.dataContainer) {
            this.create(data);
        }
        else {
            this.extend(data);
        }
        this.dispatchEvent({
            type: "objects.changed",
            objects: this.state.dataContainer.children
        });
    };
    WorldFactory.prototype.create = function (data) {
        this.state.dataContainer = new THREE.Object3D();
        this.state.dataContainer.add(data);
        var box = new THREE.Box3().setFromObject(data);
        var center = box.getCenter();
        data.userData.center = center;
        var radius = box.getBoundingSphere().radius;
        var z = radius * 4;
        var options = deepMerge({
            radius: radius,
            axisHelper: {
                on: true,
                size: radius,
                position: {
                    x: center.x,
                    y: center.y,
                    z: center.z
                }
            },
            camera: this.options.cameraPositioner.onCreate(z, radius, center),
            lights: {
                directional: {
                    center: {
                        x: center.x,
                        y: center.y,
                        z: center.z
                    },
                    position: {
                        dx: radius,
                        dy: radius,
                        dz: z
                    }
                }
            }
        }, this.options);
        if (this.state.world) {
            this.state.world.destroy();
        }
        this.state.world = new World(this.element, options);
        // window["world"] = state.world;
        this.add(this.state.dataContainer);
        this.dispatchEvent({
            type: "world.created",
            factory: this
        });
    };
    WorldFactory.prototype.getWorld = function () {
        return this.state.world;
    };
    WorldFactory.prototype.add = function (obj3d) {
        this.state.world.scene.add(obj3d);
        this.state.world.dataContainer = obj3d;
    };
    WorldFactory.prototype.extend = function (data, resize) {
        if (resize === void 0) { resize = true; }
        var center = new THREE.Box3().setFromObject(data).getCenter();
        data.userData.center = center;
        this.state.dataContainer.add(data);
        // Sometimes we don't want a flash.
        if (!resize) {
            return;
        }
        var box = new THREE.Box3().setFromObject(this.state.dataContainer);
        center = box.getCenter();
        var radius = box.getBoundingSphere().radius;
        var z = radius * 4;
        var options = Object.assign({
            radius: radius,
            axisHelper: {
                on: true,
                size: radius,
                position: {
                    x: center.x,
                    y: center.y,
                    z: center.z
                }
            },
            camera: this.options.cameraPositioner.onExtend(z, radius, center),
            lights: {
                directional: {
                    center: {
                        x: center.x,
                        y: center.y,
                        z: center.z
                    },
                    position: {
                        dx: radius,
                        dy: -radius,
                        dz: z
                    }
                }
            }
        }, this.options);
        this.state.world.update(options);
    };
    return WorldFactory;
}(THREE.EventDispatcher));

var Modifier = (function () {
    function Modifier(eventdispatcher) {
        var _this = this;
        this.eventdispatcher = eventdispatcher;
        this.callbacks = [];
        eventdispatcher.addEventListener("world.created", function (event) {
            _this.factory = event.factory;
            _this.flushCallbacks(event.factory);
        });
        eventdispatcher.addEventListener("world.destroyed", function (event) {
            _this.factory = null;
            _this.flushCallbacks(null);
        });
    }
    Modifier.prototype.flushCallbacks = function (factory) {
        if (this.callbacks) {
            this.callbacks.forEach(function (fn) {
                fn(factory);
            });
            this.callbacks = [];
        }
    };
    Modifier.prototype.onChange = function (callback) {
        var _this = this;
        setTimeout(function () { return callback(_this.factory); });
        this.callbacks.push(callback);
        return this;
    };
    return Modifier;
}());

var LabelSwitch = (function (_super) {
    __extends(LabelSwitch, _super);
    function LabelSwitch() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LabelSwitch.prototype.set = function (value) {
        if (this.factory && this.factory.getWorld()) {
            this.factory.getWorld().labels.visible = value;
        }
    };
    return LabelSwitch;
}(Modifier));

var VerticalExaggerate = (function (_super) {
    __extends(VerticalExaggerate, _super);
    function VerticalExaggerate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VerticalExaggerate.prototype.set = function (value) {
        if (this.factory && this.factory.getWorld()) {
            this.factory.getWorld().dataContainer.scale.z = value;
        }
    };
    return VerticalExaggerate;
}(Modifier));

var FileDrop = (function () {
    function FileDrop(element, handler) {
        if (!handler || typeof handler !== "function") {
            throw Error("No file handler provided");
        }
        if (!element) {
            throw Error("No element provided");
        }
        element.addEventListener("dragenter", dragenter, false);
        element.addEventListener("dragover", dragover, false);
        element.addEventListener("drop", drop, false);
        function dragenter(e) {
            e.stopPropagation();
            e.preventDefault();
            Logger.log("dragenter");
        }
        function dragover(e) {
            e.stopPropagation();
            e.preventDefault();
            Logger.log("dragover");
        }
        function drop(e) {
            e.stopPropagation();
            e.preventDefault();
            var dt = e.dataTransfer;
            var files = dt.files;
            handleFiles(files);
        }
        function handleFiles(files) {
            if (files) {
                for (var i = 0; i < files.length; i++) {
                    handler(files.item(i));
                }
            }
        }
    }
    return FileDrop;
}());

var Parser = (function (_super) {
    __extends(Parser, _super);
    function Parser() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Parser.prototype.getWorkersBase = function () {
        return Parser.codeBase + "/workers/";
    };
    return Parser;
}(EventDispatcher));
Parser.codeBase = "";

var WcsElevationPointsParser = (function (_super) {
    __extends(WcsElevationPointsParser, _super);
    function WcsElevationPointsParser(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        return _this;
    }
    WcsElevationPointsParser.prototype.parse = function () {
        var _this = this;
        var loader = new Elevation.WcsXyzLoader(this.options);
        return loader.load().then(function (res) {
            var pointGeo = new THREE.Geometry();
            var rgb = hexToRgb(_this.options.color ? _this.options.color : "#bbbbff");
            var blue = new THREE.Color().setRGB(rgb.r / 255, rgb.g / 255, rgb.b / 255);
            var lut = new THREE.Lut("land", 2200);
            lut.setMax(Math.floor(2200));
            lut.setMin(Math.floor(0));
            res.forEach(function (point, i) {
                var x = point.x;
                var y = point.y;
                var z = point.z;
                var p = new THREE.Vector3(x, y, z);
                pointGeo.vertices.push(p);
                pointGeo.colors.push(z > 0 ? lut.getColor(z) : blue);
            });
            if (res.length) {
                pointGeo.computeBoundingSphere();
                if (pointGeo.boundingSphere.radius < 5) {
                    console.log("Overriding bounding sphere radius" + pointGeo.boundingSphere.radius);
                    pointGeo.boundingSphere.radius = 5;
                }
            }
            var mat = new THREE.PointsMaterial({
                vertexColors: THREE.VertexColors,
                size: 1
            });
            var points = new THREE.Points(pointGeo, mat);
            points.userData = _this.options;
            return points;
        });
    };
    return WcsElevationPointsParser;
}(Parser));
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

var WcsElevationSurfaceParser = (function (_super) {
    __extends(WcsElevationSurfaceParser, _super);
    function WcsElevationSurfaceParser(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        return _this;
    }
    WcsElevationSurfaceParser.prototype.parse = function () {
        var _this = this;
        var loader = new Elevation.WcsXyzLoader(this.options);
        return loader.load().then(function (res) {
            var resolutionX = _this.options.resolutionX;
            var resolutionY = res.length / resolutionX;
            var geometry = new THREE.PlaneGeometry(resolutionX, resolutionY, resolutionX - 1, resolutionY - 1);
            var bbox = _this.options.bbox;
            geometry.vertices.forEach(function (vertice, i) {
                var xyz = res[i];
                var z = res[i].z;
                vertice.z = z;
                vertice.x = xyz.x;
                vertice.y = xyz.y;
            });
            if (res.length) {
                geometry.computeBoundingSphere();
                geometry.computeFaceNormals();
                geometry.computeVertexNormals();
            }
            var opacity = _this.options.opacity ? _this.options.opacity : 1;
            var material = new THREE.MeshPhongMaterial({ color: 0x0033ff, specular: 0x555555, shininess: 30, opacity: opacity, transparent: true });
            var mesh = new THREE.Mesh(geometry, material);
            mesh.userData = _this.options;
            return mesh;
        });
    };
    return WcsElevationSurfaceParser;
}(Parser));

var ElevationMaterial = (function (_super) {
    __extends(ElevationMaterial, _super);
    /**
     * Options:
     *    mandatory:
     *       resolutionX
     *       resolutionY
     *       data          // Single dimension array of z values

     *    optional:
     *       maxDepth     // Used to scale water, default 5000m (positive depth)
     *       maxElevation // Used to scale elevation, default 2200m
     */
    function ElevationMaterial(options) {
        var _this = _super.call(this, options) || this;
        _this.options = options;
        var res = options.data;
        var mask = document.createElement("canvas");
        var resolutionX = mask.width = options.resolutionX;
        var resolutionY = mask.height = options.resolutionY;
        var context = mask.getContext("2d");
        var id = context.createImageData(1, 1);
        var d = id.data;
        // TODO: Some magic numbers. I need think about them. I think the gradient should stay the same.
        var maxDepth = options.maxDepth ? options.maxDepth : ElevationMaterial.DEFAULT_MAX_DEPTH;
        var maxElevation = options.maxElevation ? options.maxElevation : ElevationMaterial.DEFAULT_MAX_ELEVATION;
        var blue = new THREE.Lut("water", maxDepth);
        var lut = new THREE.Lut("land", maxElevation);
        blue.setMax(0);
        blue.setMin(-maxDepth);
        lut.setMax(Math.floor(maxElevation));
        lut.setMin(0);
        res.forEach(function (item, i) {
            var z = item.z;
            if (z > 0) {
                var color = lut.getColor(z);
                drawPixel(i % resolutionX, Math.floor(i / resolutionX), color.r * 255, color.g * 255, color.b * 255, 255);
            }
            else {
                var color = blue.getColor(z);
                drawPixel(i % resolutionX, Math.floor(i / resolutionX), color.r * 255, color.g * 255, color.b * 255, 255);
            }
        });
        var texture = new THREE.Texture(mask);
        texture.needsUpdate = true;
        var opacity = options.opacity ? options.opacity : 1;
        _this.setValues({
            map: texture,
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide
        });
        function drawPixel(x, y, r, g, b, a) {
            d[0] = r;
            d[1] = g;
            d[2] = b;
            d[3] = a;
            context.putImageData(id, x, y);
        }
        return _this;
    }
    return ElevationMaterial;
}(THREE.MeshPhongMaterial));
ElevationMaterial.DEFAULT_MAX_DEPTH = 5000;
ElevationMaterial.DEFAULT_MAX_ELEVATION = 2200;

var WcsCanvasSurfaceParser = (function (_super) {
    __extends(WcsCanvasSurfaceParser, _super);
    function WcsCanvasSurfaceParser(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        return _this;
    }
    WcsCanvasSurfaceParser.prototype.parse = function () {
        var _this = this;
        var loader = new Elevation.WcsXyzLoader(this.options);
        return loader.load().then(function (res) {
            var resolutionX = _this.options.resolutionX;
            var resolutionY = res.length / resolutionX;
            var geometry = new THREE.PlaneGeometry(resolutionX, resolutionY, resolutionX - 1, resolutionY - 1);
            var bbox = _this.options.bbox;
            geometry.vertices.forEach(function (vertice, i) {
                var xyz = res[i];
                var z = res[i].z;
                vertice.z = z;
                vertice.x = xyz.x;
                vertice.y = xyz.y;
            });
            if (res.length) {
                geometry.computeBoundingSphere();
                geometry.computeFaceNormals();
                geometry.computeVertexNormals();
            }
            var opacity = _this.options.opacity ? _this.options.opacity : 1;
            var material = new ElevationMaterial({
                resolutionX: resolutionX,
                resolutionY: resolutionY,
                data: geometry.vertices,
                transparent: true,
                opacity: opacity,
                side: THREE.DoubleSide
            });
            var mesh = new THREE.Mesh(geometry, material);
            mesh.userData = _this.options;
            return mesh;
        });
    };
    return WcsCanvasSurfaceParser;
}(Parser));

var ElevationParser = (function (_super) {
    __extends(ElevationParser, _super);
    function ElevationParser(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        return _this;
    }
    ElevationParser.prototype.parse = function (data) {
        if (this.options.surface) {
            return new WcsElevationSurfaceParser(this.options).parse();
        }
        else if (this.options.wmsSurface) {
            return new WcsCanvasSurfaceParser(this.options).parse();
        }
        return new WcsElevationPointsParser(this.options).parse();
    };
    return ElevationParser;
}(Parser));

var EsriImageryLoader = (function () {
    function EsriImageryLoader(options) {
        this.options = options;
    }
    EsriImageryLoader.prototype.load = function () {
        var url = this.options.esriTemplate
            .replace("${bbox}", this.options.bbox)
            .replace("${format}", "JSON")
            .replace("${size}", this.options.resolutionX + "," + this.options.resolutionY);
        var loader = new Elevation.HttpTextLoader(url, this.options);
        // Get the ESRI Metadata.
        return loader.load().then(function (text) { return JSON.parse(text); });
    };
    return EsriImageryLoader;
}());

var WcsEsriImageryParser = (function (_super) {
    __extends(WcsEsriImageryParser, _super);
    function WcsEsriImageryParser(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        return _this;
    }
    WcsEsriImageryParser.prototype.loadImage = function (url, bbox) {
        var _this = this;
        // Merge the options
        var options = Object.assign({}, this.options, { bbox: bbox });
        var restLoader = new Elevation.WcsXyzLoader(options);
        return restLoader.load().then(function (res) {
            var resolutionX = _this.options.resolutionX;
            var resolutionY = res.length / resolutionX;
            var geometry = new THREE.PlaneGeometry(resolutionX, resolutionY, resolutionX - 1, resolutionY - 1);
            var bbox = _this.options.bbox;
            geometry.vertices.forEach(function (vertice, i) {
                var xyz = res[i];
                vertice.z = xyz.z;
                vertice.x = xyz.x;
                vertice.y = xyz.y;
            });
            if (res.length) {
                geometry.computeBoundingSphere();
                geometry.computeFaceNormals();
                geometry.computeVertexNormals();
            }
            var loader = new THREE.TextureLoader();
            loader.crossOrigin = "";
            var opacity = _this.options.opacity ? _this.options.opacity : 1;
            var material = new THREE.MeshPhongMaterial({
                map: loader.load(url, function (event) {
                    _this.dispatchEvent(new Event(WcsEsriImageryParser.TEXTURE_LOADED_EVENT, mesh));
                }),
                transparent: true,
                opacity: opacity,
                side: THREE.DoubleSide
            });
            var mesh = new THREE.Mesh(geometry, material);
            mesh.userData = _this.options;
            return mesh;
        });
    };
    WcsEsriImageryParser.prototype.parse = function () {
        var _this = this;
        var options = Object.assign({}, this.options, { resolutionX: this.options.imageWidth, resolutionY: this.options.imageHeight });
        if (this.options.imageOnly) {
            var url = this.options.esriTemplate
                .replace("${bbox}", this.options.bbox)
                .replace("$format}", "Image")
                .replace("${size}", this.options.resolutionX + "," + this.options.resolutionY);
            return this.loadImage(url, this.options.bbox);
        }
        // Fall through here to get the metadata first.
        return new EsriImageryLoader(options).load().then(function (esriData) {
            // Get the extent returned by ESRI
            var extent = esriData.extent;
            var bbox = [
                extent.xmin,
                extent.ymin,
                extent.xmax,
                extent.ymax
            ];
            _this.dispatchEvent(new Event(WcsEsriImageryParser.BBOX_CHANGED_EVENT, Object.assign({
                bbox: bbox,
                aspectRatio: esriData.width / esriData.height
            }, esriData)));
            return _this.loadImage(esriData.href, bbox);
        });
    };
    return WcsEsriImageryParser;
}(Parser));
WcsEsriImageryParser.BBOX_CHANGED_EVENT = "bbox.change";
WcsEsriImageryParser.TEXTURE_LOADED_EVENT = "texture.loaded";

var WmsMaterial = (function (_super) {
    __extends(WmsMaterial, _super);
    function WmsMaterial(options) {
        var _this = _super.call(this, {
            map: getLoader(options.onLoad),
            transparent: true,
            opacity: options.opacity ? options.opacity : 1,
            side: THREE.DoubleSide
        }) || this;
        _this.options = options;
        function getLoader(onLoad) {
            var loader = new THREE.TextureLoader();
            loader.crossOrigin = "";
            var url = options.template
                .replace("${width}", options.width ? options.width : 512)
                .replace("${height}", options.height ? options.height : 512)
                .replace("${bbox}", options.bbox.join(","));
            return loader.load(url, onLoad);
        }
        return _this;
    }
    return WmsMaterial;
}(THREE.MeshPhongMaterial));

var WcsWmsSurfaceParser = (function (_super) {
    __extends(WcsWmsSurfaceParser, _super);
    function WcsWmsSurfaceParser(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        return _this;
    }
    WcsWmsSurfaceParser.prototype.parse = function () {
        var _this = this;
        var loader = new Elevation.WcsXyzLoader(this.options);
        return loader.load().then(function (res) {
            var resolutionX = _this.options.resolutionX;
            var resolutionY = res.length / resolutionX;
            var geometry = new THREE.PlaneGeometry(resolutionX, resolutionY, resolutionX - 1, resolutionY - 1);
            var bbox = _this.options.bbox;
            var rgb = hexToRgb$2(_this.options.color ? _this.options.color : "#bbbbff");
            geometry.vertices.forEach(function (vertice, i) {
                var xyz = res[i];
                var z = res[i].z;
                vertice.z = z;
                vertice.x = xyz.x;
                vertice.y = xyz.y;
            });
            if (res.length) {
                geometry.computeBoundingSphere();
                geometry.computeFaceNormals();
                geometry.computeVertexNormals();
            }
            var material = new WmsMaterial({
                width: _this.options.imageWidth,
                height: _this.options.imageHeight,
                opacity: _this.options.opacity,
                template: _this.options.imageryTemplate,
                bbox: bbox
            });
            var mesh = new THREE.Mesh(geometry, material);
            mesh.userData = _this.options;
            return mesh;
        });
    };
    return WcsWmsSurfaceParser;
}(Parser));
function hexToRgb$2(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

var Pipeline = (function (_super) {
    __extends(Pipeline, _super);
    function Pipeline() {
        return _super.call(this) || this;
    }
    Pipeline.prototype.destroy = function () {
        this.removeAllListeners();
    };
    return Pipeline;
}(EventDispatcher));

var PLineToLineSegments = (function (_super) {
    __extends(PLineToLineSegments, _super);
    function PLineToLineSegments() {
        var _this = _super.call(this) || this;
        _this.hasColors = false;
        return _this;
    }
    PLineToLineSegments.prototype.destroy = function () {
        this.geometry = this.pline = this.solidColorObj = this.material = null;
        _super.prototype.destroy.call(this);
    };
    PLineToLineSegments.prototype.pipe = function (event) {
        var data = event.data;
        switch (event.eventName) {
            case "header":
                this.processHeader(data);
                break;
            case "vertices":
                this.processVertices(data);
                break;
            case "complete":
                this.complete(data);
        }
    };
    PLineToLineSegments.prototype.complete = function (pline) {
        if (!this.geometry) {
            this.dispatchEvent(new Event("error", "We have complete before we even started"));
            this.destroy();
            return;
        }
        var lut = null;
        var solidColorObj = this.solidColorObj;
        var colors = this.geometry.colors;
        if (!this.geometry.colors.length && this.geometry.vertices.length) {
            var range_1 = Math.floor(this.max - this.min);
            if (range_1) {
                lut = new THREE.Lut("rainbow", Math.floor(this.max - this.min));
                lut.setMax(Math.floor(this.max));
                lut.setMin(Math.floor(this.min));
                this.ws.forEach(function (w) {
                    var color = lut.getColor(w);
                    color = color ? color : solidColorObj;
                    colors.push(color);
                });
            }
            else {
                this.geometry.vertices.forEach(function () {
                    colors.push(solidColorObj);
                });
            }
        }
        this.geometry.computeBoundingBox();
        this.geometry.computeBoundingSphere();
        var lines = new THREE.LineSegments(this.geometry, this.material);
        lines.userData = {
            header: pline.header,
            coordinateSystem: pline.coordinateSystem
        };
        this.dispatchEvent(new Event("complete", lines));
        this.destroy();
    };
    PLineToLineSegments.prototype.processVertices = function (vertices) {
        var _this = this;
        if (!this.geometry) {
            this.dispatchEvent(new Event("error", "We have vertices before we have the header"));
            this.destroy();
            return;
        }
        var target = this.geometry.vertices;
        var colors = this.geometry.colors;
        var solidColorObj = this.solidColorObj;
        vertices.forEach(function (vertex, i) {
            target.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
            if (vertex.length < 3) {
                colors.push(solidColorObj);
            }
            else {
                var w = +vertex[3];
                _this.min = Math.min(_this.min, w);
                _this.max = Math.max(_this.max, w);
                _this.ws.push(w);
            }
        });
        Logger.log("WE have " + target.length + " vertices now");
    };
    PLineToLineSegments.prototype.processHeader = function (data) {
        if (this.geometry) {
            this.dispatchEvent(new Event("error", "We already have processed a header. How did this happen?"));
            this.destroy();
            return;
        }
        this.geometry = new THREE.Geometry();
        this.pline = data;
        var rawColor = data.header.color ? data.header.color : 0xffffff;
        this.solidColorObj = new THREE.Color(rawColor);
        var width = data.header.width ? data.header.width : 10;
        this.material = new THREE.LineBasicMaterial({
            linewidth: width,
            color: rawColor,
            vertexColors: THREE.VertexColors
        });
        this.min = Infinity;
        this.max = -Infinity;
        this.ws = [];
    };
    return PLineToLineSegments;
}(Pipeline));

var TSurfToMesh = (function (_super) {
    __extends(TSurfToMesh, _super);
    function TSurfToMesh() {
        return _super.call(this) || this;
    }
    TSurfToMesh.prototype.destroy = function () {
        this.geometry = null;
        _super.prototype.destroy.call(this);
    };
    TSurfToMesh.prototype.pipe = function (event) {
        var data = event.data;
        switch (event.eventName) {
            case "header":
                this.processHeader(data);
                break;
            case "vertices":
                this.processVertices(data);
                break;
            case "faces":
                this.processFaces(data);
                break;
            case "complete":
                this.complete(data);
        }
    };
    TSurfToMesh.prototype.complete = function (data) {
        if (!this.geometry) {
            this.dispatchEvent(new Event("error", "We have complete before we even started"));
            this.destroy();
            return;
        }
        this.geometry.boundingBox = BoxFactory.toThreeBox3(data.bbox);
        var color = data.header.solidColor;
        var mat = new THREE.MeshLambertMaterial({
            color: color ? color : 0xff1111,
            side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(this.geometry, mat);
        mesh.userData = {
            header: data.header,
            coordinateSystem: data.coordinateSystem
        };
        this.dispatchEvent(new Event("complete", mesh));
        this.destroy();
    };
    TSurfToMesh.prototype.processFaces = function (faces) {
        if (!this.geometry) {
            this.dispatchEvent(new Event("error", "We have faces before we have the header"));
            this.destroy();
            return;
        }
        var target = this.geometry.faces;
        faces.forEach(function (face) {
            var response = new THREE.Face3(face[0], face[1], face[2]);
            var normal = face[3];
            response.normal = new THREE.Vector3(normal.x, normal.y, normal.z);
            target.push(response);
        });
    };
    TSurfToMesh.prototype.processVertices = function (vertices) {
        if (!this.geometry) {
            this.dispatchEvent(new Event("error", "We have vertices before we have the header"));
            this.destroy();
            return;
        }
        var target = this.geometry.vertices;
        vertices.forEach(function (vertex) {
            target.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
        });
    };
    TSurfToMesh.prototype.processHeader = function (data) {
        if (this.geometry) {
            this.dispatchEvent(new Event("error", "We already have processed a header. How did this happen?"));
            this.destroy();
            return;
        }
        this.geometry = new THREE.Geometry();
    };
    return TSurfToMesh;
}(Pipeline));

var VSetToPoints = (function (_super) {
    __extends(VSetToPoints, _super);
    function VSetToPoints() {
        return _super.call(this) || this;
    }
    VSetToPoints.prototype.destroy = function () {
        this.geometry = null;
        _super.prototype.destroy.call(this);
    };
    VSetToPoints.prototype.pipe = function (event) {
        var data = event.data;
        switch (event.eventName) {
            case "header":
                this.processHeader(data);
                break;
            case "vertices":
                this.processVertices(data);
                break;
            case "complete":
                this.complete(data);
        }
    };
    VSetToPoints.prototype.complete = function (data) {
        if (!this.geometry) {
            this.dispatchEvent(new Event("error", "We have complete before we even started"));
            this.destroy();
            return;
        }
        var mat = new THREE.PointsMaterial({ size: 16, color: data.header.color });
        this.geometry.boundingBox = BoxFactory.toThreeBox3(data.bbox);
        var particles = new THREE.Points(this.geometry, mat);
        this.geometry.computeBoundingSphere();
        particles.userData = {
            header: data.header,
            coordinateSystem: data.coordinateSystem
        };
        this.dispatchEvent(new Event("complete", particles));
        this.destroy();
    };
    VSetToPoints.prototype.processVertices = function (vertices) {
        if (!this.geometry) {
            this.dispatchEvent(new Event("error", "We have vertices before we have the header"));
            this.destroy();
            return;
        }
        var target = this.geometry.vertices;
        vertices.forEach(function (vertex) {
            target.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
        });
        Logger.log("WE have " + target.length + " vertices now");
    };
    VSetToPoints.prototype.processHeader = function (data) {
        if (this.geometry) {
            this.dispatchEvent(new Event("error", "We already have processed a header. How did this happen?"));
            this.destroy();
            return;
        }
        this.geometry = new THREE.Geometry();
    };
    return VSetToPoints;
}(Pipeline));

/**
 * It just gobbles up the events until complete. Sort of a bit bucket.
 */
var UnknownSink = (function (_super) {
    __extends(UnknownSink, _super);
    function UnknownSink() {
        var _this = _super.call(this) || this;
        Logger.warn("We don't understand this type but we'll soldier on.");
        return _this;
    }
    UnknownSink.prototype.pipe = function (event) {
        if (event.eventName === "complete") {
            this.dispatchEvent(new Event("complete", {}));
        }
    };
    return UnknownSink;
}(Pipeline));

var State;
(function (State) {
    State[State["Empty"] = 0] = "Empty";
    State[State["Loading"] = 1] = "Loading";
})(State || (State = {}));

var PipeToThreedObj = (function (_super) {
    __extends(PipeToThreedObj, _super);
    function PipeToThreedObj() {
        var _this = _super.call(this) || this;
        /**
         * We only have two events, error and complete and the result is much the same.
         * * Clean up,
         * * Bubble up.
         */
        _this.onEvent = function (event) {
            var bubble = event;
            if (event.type === "complete") {
                bubble = new Event("complete", event.data);
            }
            _this.dispatchEvent(bubble);
            _this.destroy();
        };
        _this.state = State.Empty;
        return _this;
    }
    PipeToThreedObj.prototype.pipe = function (event) {
        switch (this.state) {
            case State.Empty:
                this.pipeHeader(event);
                break;
            case State.Loading:
                this.next.pipe(event);
        }
    };
    PipeToThreedObj.prototype.pipeHeader = function (event) {
        switch (event.eventName) {
            case "start":
                break;
            case "header":
                var data = event.data;
                switch (data.type) {
                    case "TSurf":
                        this.next = new TSurfToMesh();
                        break;
                    case "PLine":
                        this.next = new PLineToLineSegments();
                        break;
                    case "VSet":
                        this.next = new VSetToPoints();
                        break;
                    default:
                        this.next = new UnknownSink();
                }
                this.next.addEventListener("complete", this.onEvent);
                this.next.addEventListener("error", this.onEvent);
                this.next.pipe(event);
                this.state = State.Loading;
        }
    };
    PipeToThreedObj.prototype.destroy = function () {
        if (this.state === State.Loading) {
            this.next.destroy();
            this.state = State.Empty;
            this.next = null;
            _super.prototype.destroy.call(this);
        }
    };
    return PipeToThreedObj;
}(Pipeline));

var Logger$1 = (function () {
    function Logger() {
    }
    Logger.noop = function () { };

    Object.defineProperty(Logger, "level", {
        set: function (value) {
            var num = parseInt(value);
            num = num === NaN ? 0 : num;
            if (!Logger._broken) {
                Logger.log = console.log;
                try {
                    Logger.log("Setting log level");
                }
                catch (e) {
                    Logger._broken = true;
                }
            }
            if (Logger._broken) {
                Logger.log = num >= 64 ? function (main) { console.log(main); } : Logger.noop;
                Logger.info = num >= 32 ? function (main) { console.info(main); } : Logger.noop;
                Logger.warn = num >= 16 ? function (main) { console.warn(main); } : Logger.noop;
                Logger.log = num >= 8 ? function (main) { console.log(main); } : Logger.noop;
            }
            else {
                // We get to keep line numbers if we do it this way.
                Logger.log = num >= 64 ? console.log : Logger.noop;
                Logger.info = num >= 32 ? console.info : Logger.noop;
                Logger.warn = num >= 16 ? console.warn : Logger.noop;
                Logger.error = num >= 8 ? console.error : Logger.noop;
            }
        },
        enumerable: true,
        configurable: true
    });
    return Logger;
}());
Logger$1.LOG_ALL = 64;
Logger$1.LOG_INFO = 32;
Logger$1.LOG_WARN = 16;
Logger$1.LOG_ERROR = 8;
Logger$1.LOG_NOTHING = 0;
Logger$1._broken = false;
Logger$1.log = Logger$1.noop;
Logger$1.error = Logger$1.noop;
Logger$1.info = Logger$1.noop;
Logger$1.warn = Logger$1.noop;

var GocadPusherParser = (function (_super) {
    __extends(GocadPusherParser, _super);
    function GocadPusherParser(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        return _this;
    }
    GocadPusherParser.prototype.parse = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var worker = new Worker(_this.getWorkersBase() + GocadPusherParser.WORKER_NAME);
            var pipe = new PipeToThreedObj();
            pipe.addEventListener("complete", function (event) {
                worker.terminate();
                resolve(event.data);
            });
            pipe.addEventListener("error", function (event) {
                worker.terminate();
                Logger$1.log("There is an error with your pipes!");
                reject(event.data);
            });
            worker.addEventListener("message", function (response) {
                var message = JSON.parse(response.data);
                pipe.pipe(message);
                Logger$1.log("EVENT = " + message.eventName);
            });
            worker.addEventListener("error", function (err) {
                Logger$1.log("There is an error with your worker!");
                Logger$1.log(err);
            });
            worker.postMessage(data);
        });
    };
    return GocadPusherParser;
}(Parser));
GocadPusherParser.WORKER_NAME = "gocadpusher.js";

var HttpGocadPusherParser = (function (_super) {
    __extends(HttpGocadPusherParser, _super);
    function HttpGocadPusherParser(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        return _this;
    }
    HttpGocadPusherParser.prototype.parse = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var worker = new Worker(_this.getWorkersBase() + HttpGocadPusherParser.WORKER_NAME);
            var pipe = new PipeToThreedObj();
            pipe.addEventListener("complete", function (event) {
                worker.terminate();
                resolve(event.data);
            });
            pipe.addEventListener("error", function (event) {
                worker.terminate();
                Logger$1.log("There is an error with your pipes!");
                reject(event.data);
            });
            worker.addEventListener("message", function (response) {
                var message = JSON.parse(response.data);
                pipe.pipe(message);
                Logger$1.log("EVENT = " + message.eventName);
            });
            worker.addEventListener("error", function (err) {
                Logger$1.log("There is an error with your worker!");
                Logger$1.log(err);
            });
            worker.postMessage(data);
        });
    };
    return HttpGocadPusherParser;
}(Parser));
HttpGocadPusherParser.WORKER_NAME = "gocadhttppusher.js";

var eventList = [
    "start",
    "complete",
    "bstones",
    "borders",
    "header",
    "vertices",
    "faces",
    "lines",
    "properties"
];
/**
 * Uses the block reading parser in the current UI thread. in
 * other words single threading. Mainly for debugging as its
 * easier to debug.
 */
var LocalGocadPusherParser = (function (_super) {
    __extends(LocalGocadPusherParser, _super);
    function LocalGocadPusherParser(options) {
        if (options === void 0) { options = {}; }
        var _this = _super.call(this) || this;
        _this.options = options;
        return _this;
    }
    LocalGocadPusherParser.prototype.parse = function (data) {
        var _this = this;
        var file = data.file;
        var options = data.options;
        return new Promise(function (resolve, reject) {
            var pusher = new DocumentPusher(_this.options, proj4);
            // Turn blocks of lines into lines
            var linesToLinePusher = new LinesToLinePusher(function (line) {
                pusher.push(line);
            });
            var pipe = new PipeToThreedObj();
            pipe.addEventListener("complete", function (event) {
                resolve(event.data);
            });
            pipe.addEventListener("error", function (event) {
                Logger$1.log("There is an error with your pipes!");
                reject(event.data);
            });
            new LinesPagedPusher(file, options, function (lines) {
                linesToLinePusher.receiver(lines);
            }).start().then(function () {
                Logger$1.log("******************* Local Kaput ****************************");
            });
            eventList.forEach(function (name) {
                Logger$1.log("Adding listener: " + name);
                pusher.addEventListener(name, function defaultHandler(event) {
                    Logger$1.log("GPW: " + event.type);
                    pipe.pipe({
                        eventName: event.type,
                        data: event.data
                    });
                });
            });
        });
    };
    return LocalGocadPusherParser;
}(Parser));

/**
 * Use as a wrapper around other parsers to limit the number of concurrent web workers.
 * The constructor takes the wrapped parser and an optional count of web workers.
 * The default count is 7 as that means you get roughly 100% peak CPU use on an
 * 8 core CPU as the UI is using one core.
 */
var ThrottleProxyParser = (function (_super) {
    __extends(ThrottleProxyParser, _super);
    function ThrottleProxyParser(parser, max) {
        if (max === void 0) { max = 7; }
        var _this = _super.call(this) || this;
        _this.parser = parser;
        _this.max = max;
        _this.stack = [];
        _this.count = 0;
        return _this;
    }
    ThrottleProxyParser.prototype.parse = function (file, options) {
        var self = this;
        var waiter = {
            timestamp: Date.now(),
            file: file,
            options: options,
            self: self
        };
        var promise = new Promise(function (resolve) {
            waiter.resolver = resolve;
        });
        this.stack.push(waiter);
        this.count++;
        checkJobs();
        runCleaner();
        return promise;
        function runCleaner() {
        }
        function checkJobs() {
            Logger$1.log("We have " + self.count + " jobs queued");
            if (self.count > self.max || self.count < 1) {
                return;
            }
            runJob();
        }
        function runJob() {
            Logger$1.log("Jobs length = " + self.count);
            var job = self.stack.shift();
            if (job) {
                job.self.parser.parse(job.file, job.options).then(function (response) {
                    decrementCount();
                    runJob();
                    job.resolver(response);
                }).catch(function (err) {
                    Logger$1.log("Ooops!");
                    Logger$1.log(err);
                    decrementCount();
                });
            }
        }
        function decrementCount() {
            if (self.count > 0) {
                self.count--;
            }
        }
    };
    return ThrottleProxyParser;
}(Parser));

exports.loadBorders = loadBorders;
exports.loadBstones = loadBstones;
exports.CameraPositioner = CameraPositioner;
exports.DefaultWorldFactory = DefaultWorldFactory;
exports.WorldFactory = WorldFactory;
exports.LabelSwitch = LabelSwitch;
exports.VerticalExaggerate = VerticalExaggerate;
exports.FileDrop = FileDrop;
exports.Parser = Parser;
exports.ElevationParser = ElevationParser;
exports.WcsEsriImageryParser = WcsEsriImageryParser;
exports.WcsWmsSurfaceParser = WcsWmsSurfaceParser;
exports.GocadPusherParser = GocadPusherParser;
exports.HttpGocadPusherParser = HttpGocadPusherParser;
exports.LocalGocadPusherParser = LocalGocadPusherParser;
exports.ThrottleProxyParser = ThrottleProxyParser;
exports.ElevationMaterial = ElevationMaterial;
exports.WmsMaterial = WmsMaterial;
exports.DocumentPusher = DocumentPusher;
exports.LinesToLinePusher = LinesToLinePusher;
exports.HttpPusher = HttpPusher;
exports.LinesPagedPusher = LinesPagedPusher;
exports.Logger = Logger;

Object.defineProperty(exports, '__esModule', { value: true });

})));
