export class TextSprite {
   constructor(public options) {

   }

   make(message) {
      let parameters = this.options;

      let parms = Object.assign({
         fontface: "Arial",
         fontsize: 14,
         padding: 12,
         rounding: 0,
         borderThickness: 2,
         borderColor: { r: 0, g: 0, b: 0, a: 1.0 },
         backgroundColor: { r: 255, g: 255, b: 255, a: 1 }
      }, parameters ? parameters : {});

      let scale = this.options.scale;

      let canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.width = 24 + message.length * 5;
      canvas.height = 48;
      let context = canvas.getContext("2d");
      context.font = parms.fontsize + "px " + parms.fontface;

      // get size data (height depends only on font size)
      let metrics = context.measureText(message);
      let textWidth = metrics.width;

      // background color
      context.fillStyle = "rgba(" + parms.backgroundColor.r + "," + parms.backgroundColor.g + ","
         + parms.backgroundColor.b + "," + parms.backgroundColor.a + ")";
      // border color
      context.strokeStyle = "rgba(" + parms.borderColor.r + "," + parms.borderColor.g + ","
         + parms.borderColor.b + "," + parms.borderColor.a + ")";

      context.lineWidth = parms.borderThickness;
      this.roundRect(context,
         parms.borderThickness / 2,
         parms.borderThickness / 2,
         textWidth + parms.borderThickness,
         parms.fontsize * 1.4 + parms.borderThickness,
         parms.rounding
      );
      // 1.4 is extra height factor for text below baseline: g,j,p,q.

      // text color
      context.fillStyle = "rgba(0, 0, 0, 1.0)";
      context.fillText(message, parms.borderThickness, parms.fontsize + parms.borderThickness);

      // canvas contents will be used for a texture
      let texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;

      let spriteMaterial = new THREE.SpriteMaterial({
         map: texture
      });
      let sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(scale * 25, scale * 15, 1); // scale * 1);

      return sprite;
   }

   // function for drawing rounded rectangles
   roundRect(ctx, x, y, w, h, r) {
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

}