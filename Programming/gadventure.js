var IMG_PATH, IMG_EXTENSION;
IMG_PATH = "images/"
IMG_EXTENSION = ".png"

//==================================================
// scene object
//==================================================
function scene(name, text, exits, item) {
	var i;

  // name of this scene. used by exit objects to tell us where to go.
  // also used to construct the img src attribute, so get it right!
  this.name = name;
  
  // Text to display
  this.text = text;
 
  // Player exits for this scene.
  this.exits = exits;
   
  // Inventory items found in this room.
  // Automatically picked up upon entrance.
  this.item = item;
  
  // Create an image object for the slide
  if (document.images) {
    this.image = new Image();
  }

  // Flag to tell when load() has already been called
  this.loaded = false;

  //--------------------------------------------------
  this.load = function() {
    // This method loads the image for the scene

    if (!document.images) { return; }

    if (!this.loaded) {
      this.image.src = IMG_PATH + this.name + IMG_EXTENSION;
      this.loaded = true;
    }
  }
}

//==================================================
// world object
//==================================================
function world() {
  // IMAGE element on your HTML page.
  // For example, document.images.MYIMG
  this.image;

  // Current text string to display.
  this.text;
  
  // ID of a DIV element on your HTML page that will contain the text.
  // For example, "img2text"
  // Note: after you set this variable, you should call
  // the update() method to update the display.
  this.textid;
  

  // These are private variables
  this.scenes = new Array();
  this.current = 0;
  
  //--------------------------------------------------
  // Public methods
  //--------------------------------------------------
  this.add_scene = function(scene) {
    // Add a scene to the world.
    // For example:
    // SCENES1.add_scene(new scene("start", "s1.jpg", "T'was a dark and stormy night", exits))
  
    var i = this.scenes.length;
  
    // Prefetch the image if necessary
    if (this.prefetch == -1) {
      scene.load();
    }

    this.scenes[i] = scene;
  }
  
  this.sceneNameToIndex = function(name) {
  	var i;
  	for (i=0; i < this.scenes.length; ++i) {
  		if (this.scenes[i].name == name) {
  			return i;
  		}
  	}
  	return -1;
  }

  //--------------------------------------------------
  this.update = function() {
    // This method updates the current image on the page

    // Make sure the world has been initialized correctly
    if (! this.valid_image()) { return; }
  
    // Call the pre-update hook function if one was specified
    if (typeof this.pre_update_hook == 'function') {
      this.pre_update_hook();
    }

    // Convenience variable for the current slide
    var scene = this.scenes[ this.current ];

    // Determine if the browser supports filters
    var dofilter = false;
    if (this.image &&
        typeof this.image.filters != 'undefined' &&
        typeof this.image.filters[0] != 'undefined') {

      dofilter = true;

    }

    // Load the slide image if necessary
    scene.load();
  
    // Apply the filters for the image transition
    if (dofilter) {

      // If the user has specified a custom filter for this slide,
      // then set it now
      if (scene.filter &&
          this.image.style &&
          this.image.style.filter) {

        this.image.style.filter = scene.filter;

      }
      this.image.filters[0].Apply();
    }

    // Update the image, its map
    this.image.src = scene.image.src;
    this.image.useMap = '#' + scene.name;
    

    // Play the image transition filters
    if (dofilter) {
      this.image.filters[0].Play();
    }

    // Update the text
    this.display_text();

    // Call the post-update hook function if one was specified
    if (typeof this.post_update_hook == 'function') {
      this.post_update_hook();
    }

    // Do we need to pre-fetch images?
    if (this.prefetch > 0) {

      // Pre-fetch the next scene image(s)
      var i, next;
      for ( i=0; i < scene.exits.length; ++i) {
			next = this.sceneNameToIndex(scene.exits[i]);
			if (next != -1) {
				this.scenes[next].load();
			}
      }
    }
  }
  
  this.get_scene = function(name) {
  	return this.scenes[this.sceneNameToIndex(name)];	
  }

  
//--------------------------------------------------
  this.goto_scene = function(name) {
  	var i;
    // This method jumpts to the scene you specify.

	i = this.sceneNameToIndex(name);
    if (i == -1) {
      console.log("bad scene name");
    }
  
    if (i < this.scenes.length && i >= 0) {
      this.current = i;
      this.text = this.scenes[i].text;
    }  
    this.update();
  }
  

//--------------------------------------------------
  this.display_text = function() {
    // Display the text

    // If a text id has been specified,
    // then change the contents of the HTML element
    if (this.textid) {

      r = this.getElementById(this.textid);
      if (!r) { return false; }
      if (typeof r.innerHTML == 'undefined') { return false; }

      // Update the text
      r.innerHTML = this.text;
    }
  }
  
//--------------------------------------------------
  this.save_position = function(cookiename) {
    // Saves our position in a cookie, so when you return to this page,
    // the position won't be lost.
  
    if (!cookiename) {
      cookiename = this.name + '_gworld';
    }
  
    document.cookie = cookiename + '=' + this.current;
  }
  //--------------------------------------------------
  this.restore_position = function(cookiename) {
  // If you previously called save_position(),
  // returns the world to the previous state.
  
    //Get cookie code by Shelley Powers
  
    if (!cookiename) {
      cookiename = this.name + '_gworld';
    }
  
    var search = cookiename + "=";
  
    if (document.cookie.length > 0) {
      offset = document.cookie.indexOf(search);
      // if cookie exists
      if (offset != -1) { 
        offset += search.length;
        // set index of beginning of value
        end = document.cookie.indexOf(";", offset);
        // set index of end of cookie value
        if (end == -1) end = document.cookie.length;
        this.current = parseInt(unescape(document.cookie.substring(offset, end)));
        }
     }
  }

  //--------------------------------------------------
  this.valid_image = function() {
    // Returns 1 if a valid image has been set for the scene
  
    if (!this.image)
    {
      return false;
    }
    else {
      return true;
    }
  }

  //--------------------------------------------------
  this.getElementById = function(element_id) {
    // This method returns the element corresponding to the id

    if (document.getElementById) {
      return document.getElementById(element_id);
    }
    else if (document.all) {
      return document.all[element_id];
    }
    else if (document.layers) {
      return document.layers[element_id];
    } else {
      return undefined;
    }
  }

}
 
// HAAAAAAAAAAAAAAAAAAAAAAACK! 
function statehack() {
	
    this.inventoryid;
    // list of strings representing inventory.
    this.inventory = new Array();

	this.busClicks = 0;
	this.photoalbumClicks = 0;
	this.tvClicks = 0;
	this.ewClicks = 0;
	this.basementClicks = 0;
	this.sadCautionDoorClicks = 0;
	this.cabinetClicks = 0;
	this.sacrificeClicks = 0;
	this.stairClicks = 0;
	this.visitedHouse = 0;
	
	//--------------------------------------------------
  this.addto_inventory = function(item,displaytext) {
  	if (item == null || item == "") return;
  	
  	var i;
  	for (i = 0; i < this.inventory.length; ++i) {
  		if (this.inventory[i] == item) {
  			return;
  		}
  	}
  	this.inventory[i] = item;  	
  	
  	var inv, img;
  	if (this.inventoryid) {
	    inv = document.getElementById(this.inventoryid);
    	img = inv.getElementsByTagName("img");
    	img[i].src= IMG_PATH + item + IMG_EXTENSION;
	   	img[i].alt= displaytext;
    	img[i].title= displaytext;

  	}
  }

	this.has = function(thing) {
		var i;
		for (i=0; i < this.inventory.length; ++i) {
			if (this.inventory[i] == thing) {
				return true;
			}
		}
		return false;
	}
	
	this.updateBus = function() {
		if (this.busClicks == 0) {
			gworld.text="hola";
		}
		if (this.busClicks == 1) {
			gworld.text="hola again";
		}
		if (this.busClicks == 2) {
			gworld.text="";
		}
		if (this.busClicks == 3) {
			gworld.text=""
		}
		this.busClicks =(this.busClicks+1)%4;
	}

	
}