function loop(){
	window.game.update();
	requestAnimationFrame(loop);
}

class Game{
	constructor(){
		this.canvasElm = document.createElement("canvas");
		this.canvasElm.width = 800;
		this.canvasElm.height = 600;
		
		this.worldSpaceMatrix = new M3x3();
		
		this.gl = this.canvasElm.getContext("webgl2");
		this.gl.clearColor(0.4,0.6,1.0,1.0);
		
		document.body.appendChild(this.canvasElm);
		
		let vs = document.getElementById("vs_01").innerHTML;
		let fs = document.getElementById("fs_01").innerHTML;
		
		this.backBuffer = new BackBuffer(this.gl, {width:512, height:240});
		this.lightBuffer = new BackBuffer(this.gl, {width:512, height:240});
		
		this.sprite1 = new Sprite(this.gl, "img/manonfire.png", vs, fs, {width:48, height:48});
		this.sprite2 = new Sprite(this.gl, "img/walker.png", vs, fs, {width:64, height:64});
		this.halo = new Sprite(this.gl, "img/halo.gif", vs, fs, {width:256, height:256});
		this.white = new Sprite(this.gl, "img/white.png", vs, fs, {width:1, height:1});
		
		this.sprite1Pos = new Point();
		this.sprite2Pos = new Point();
		
		this.sprite1Frame = new Point();
		this.sprite2Frame = new Point();
	}
	
	resize(x,y){
		this.canvasElm.width = x;
		this.canvasElm.height = y;
		
		let wRatio = x / (y/240);
		this.worldSpaceMatrix = new M3x3().transition(-1, 1).scale(2/wRatio,-2/240);
	}
	
	setBuffer(buffer){
		let gl = this.gl;
		if(buffer instanceof BackBuffer){
			gl.viewport(0,0, buffer.size.x, buffer.size.y);
			gl.bindFramebuffer(gl.FRAMEBUFFER, buffer.fbuffer);
			gl.clear(gl.COLOR_BUFFER_BIT);
		} else {
			gl.viewport(0,0, this.canvasElm.width, this.canvasElm.height);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
	}
	
	update(){
		this.setBuffer();
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		
		this.sprite1Frame.x = (new Date() * 0.006) % 3;
		this.sprite1Frame.y = (new Date() * 0.002) % 2;
		
		this.sprite2Frame.x = (new Date() * 0.006) % 3;
		this.sprite2Frame.y = (new Date() * 0.002) % 2;
		
		this.sprite2Pos.x = (this.sprite2Pos.x + 1.1) % 256;
		
		this.setBuffer(this.backBuffer);
		this.sprite1.render(this.sprite1Pos, this.sprite1Frame);
		this.sprite2.render(this.sprite2Pos, this.sprite2Frame);
		
		
		this.setBuffer(this.lightBuffer);
		this.white.render(new Point(), new Point(), {scalex:512,scaley:240,u_color:[0.125,0.125,0.25,1]});
		
		this.gl.blendFunc(this.gl.ONE, this.gl.ONE);
		this.halo.render(new Point(32,-64), new Point());
		
		this.setBuffer();
		
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		this.backBuffer.render();
		this.gl.blendFunc(this.gl.DST_COLOR, this.gl.ZERO);
		this.lightBuffer.render();
		
		this.gl.flush();
	}
}