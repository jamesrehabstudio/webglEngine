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
		this.gl.enable(this.gl.BLEND);
		
		document.body.appendChild(this.canvasElm);
		
		let vs = document.getElementById("vs_01").innerHTML;
		let fs = document.getElementById("fs_01").innerHTML;
		
		this.backBuffer = new BackBuffer(this.gl, {width:512, height:240});
		this.finalBuffer = new BackBuffer(this.gl, {width:512, height:240});
		
		
		this.sprites = {
			"manonfire" : new Sprite(this.gl, "img/manonfire.png", vs, fs, {width:48, height:48}),
			"walker" : new Sprite(this.gl, "img/walker.png", vs, fs, {width:64, height:64}),
			"halo" : new Sprite(this.gl, "img/halo.gif", vs, fs, {width:256, height:256}),
			"white" : new Sprite(this.gl, "img/white.png", vs, fs, {width:1, height:1}),
		};
		
		this.sprite1Pos = new Point();
		this.sprite2Pos = new Point();
		
		this.sprite1Frame = new Point();
		this.sprite2Frame = new Point();
		
		this.gatherRenderables();
	}
	
	gatherRenderables(){
		this.renderables = {
			layers : [
				{
					blendmode:0, objs : [
						{sprite:"manonfire",position:{x:32,y:32},frame:{x:0,y:0},flip:false,blendmode:0,options:{}},
						{sprite:"walker",position:{x:64,y:64},frame:{x:0,y:0},flip:false,blendmode:Game.BLENDMODE_ALPHA,options:{}},
					],
				},
				{
					blendmode:Game.BLENDMODE_MULTIPLY, objs : [
						{sprite:"white",position:{x:0,y:0},frame:{x:0,y:0},flip:false,blendmode:0,options:{scalex:512,scaley:240,u_color:[0.5,0.125,0.25,1]}},
						{sprite:"halo",position:{x:128,y:80},frame:{x:0,y:0},flip:false,blendmode:Game.BLENDMODE_ADDITITVE,options:{}},
					],
				}
			
			]
		}
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
		} else {
			gl.viewport(0,0, this.canvasElm.width, this.canvasElm.height);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
	}
	
	setBlendmode(bm){
		switch(bm){
			case Game.BLENDMODE_ALPHA: 
				this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA); break;
			case Game.BLENDMODE_ADDITITVE: 
				this.gl.blendFunc(this.gl.ONE, this.gl.ONE); break;
			case Game.BLENDMODE_MULTIPLY: 
				this.gl.blendFunc(this.gl.DST_COLOR, this.gl.ZERO); break;
		}
	}
	
	update(){
		
		for(let l=0; l < this.renderables.layers.length; l++){
			let layer = this.renderables.layers[l];
			
			this.setBuffer(this.backBuffer);
			this.gl.clear(this.gl.COLOR_BUFFER_BIT);
			
			for(let i=0; i < layer.objs.length; i++){
				let obj = layer.objs[i];
				let sprite = this.sprites[obj.sprite];
				
				this.setBlendmode(obj.blendmode);
				sprite.render(obj.position, obj.frame, obj.options);
			}
			
			this.setBlendmode(layer.blendmode);
			this.setBuffer(this.finalBuffer);
			this.backBuffer.render();
			
		}
		
		this.setBuffer();
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.setBlendmode(Game.BLENDMODE_ALPHA);
		this.finalBuffer.render();
		
		this.gl.flush();
	}
}
Game.BLENDMODE_ALPHA = 0;
Game.BLENDMODE_ADDITITVE = 1;
Game.BLENDMODE_MULTIPLY = 2;
