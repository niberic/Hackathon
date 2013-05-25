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
			gworld.text="\"I think I saw a coffee shop 15 miles back.\"";
		}
		if (this.busClicks == 1) {
			gworld.text="\"I'm going to leave you teenagers here for a few hours without any supervision.\"";
		}
		if (this.busClicks == 2) {
			gworld.text="\"Isn't it weird that we all forgot our cellphones today?\"";
		}
		if (this.busClicks == 3) {
			gworld.text="\"I actually have my cell phone, but somehow it got all stabbed up.\""
		}
		this.busClicks =(this.busClicks+1)%4;
	}
	
	this.updateBus1 = function() {
		if (this.busClicks == 0) {
			gworld.text="Your bus has an empty.";
		}
		if (this.busClicks == 1) {
			gworld.text="\"Is this the same bus I was driving earlier?\"";
		}
		if (this.busClicks == 2) {
			gworld.text="\"I'm sure they'll pop up again.\"";
		}
		this.busClicks =(this.busClicks+1)%3;
	}

	this.roadClicks=0;	
	this.updateRoad = function() {
		if (this.roadClicks == 0) {
			gworld.text="Either my vision is blurry or the road is furry.";
		}
		if (this.roadClicks == 1) {
			gworld.text="I wonder if it's felt.";
		}
		if (this.roadClicks == 2) {
			gworld.text="It is now!";
		}
		if (this.roadClicks == 3) {
			gworld.text="You lick the furry trail.";
		}
		this.roadClicks =(this.roadClicks+1)%3;
	}
		
	
	this.updateEntrance = function() {
		var entrance = gworld.get_scene("entrance");
		entrance.text = "The house appears to be empty but you hear an engine running nearby.";
	}
	
	this.beenUpstairs = false;
	this.checkStairDeath = function() {
		if(this.has("inv_tread")) {
			this.updateEntrance();
			gworld.goto_scene("upstairs");
			if (!this.beenUpstairs) {
				gworld.text = "With the help of those handy tank treads, you make it up the crumbling stairs with ease.";
				changeAudio("music/track2",true);
			}
			this.beenUpstairs = true;
			return;
		}
		
		if (this.stairClicks == 0) {
			gworld.text = "Those stairs don't look very safe...";
			this.stairClicks = 1;
		}
		else {
			changeAudio("music/death",true);
			gworld.goto_scene("stairdeath");
		}
	}
	
	this.chairClicks = 0;
	this.updateDullKnife = function() {
		if (this.has("inv_knife_dull") || this.has("inv_knife_sharp")) {
			if (this.chairClicks == 0)
				gworld.text ="You plop down in the dusty old chair again. What's this? You find another knife. Oh wait, it's just a toenail clipping.";
			else if (this.chairClicks == 1)
				gworld.text = "I don't trust this furniture. It looks seaty.";
			else
				gworld.text = "Resistance is futon.";
			this.chairClicks = (this.chairClicks+1)%3;
			
			return;
		}
		this.addto_inventory("inv_knife_dull", "A dull knife");
		gworld.text="You sit down in some stranger's chair because 'Hey, why not?'. Feeling mild discomfort in your rear, you reach deep into the cushion and discover a dull knife. You were hoping for a Dorito.<br><span style='color: #f7bc50'><i>You have a DULL KNIFE.</i></span>";
	}
	
	this.updatePhotoAlbum = function() {
		if (this.has("inv_sad")) {
			gworld.text="There's too much pain in there.";
			return;
		}
		if (this.has("inv_happy")) {
			photo = gworld.get_scene("photodeath");
			photo.text="As you flip through this tragic collection of family photos, you are filled with sadness.<br>Luckily you have a tiny bit of A HAPPY in your heart. Now you are just moderately sad.<br><span style='color: #f7bc50'><i>You have A SAD.</i></span>";
			var map = document.getElementById("photodeath");
			var i;
			areas = map.getElementsByTagName('area');
			for (i=0; i < areas.length; ++i) {
				areas[i].setAttribute("onClick","gworld.goto_scene(\'living\');gworld.update();");
			}
			state.addto_inventory("inv_sad","A sad");
			gworld.goto_scene("photodeath");
		}
		else {
			if (this.photoalbumClicks == 0) {
			gworld.text = "On one hand you think 'Maybe I should open that book of family photos.'<br>On the other, you think 'Perhaps I should stop snooping around the houses of strangers.'";
			}
			else {
				changeAudio("music/death",true);
				gworld.goto_scene("photodeath");
			}
		}		
		
		this.photoalbumClicks++;
	}
	
	this.globeClicks = 0;
	this.updateSnowglobe = function() {
		if (this.globeClicks == 0) {
			gworld.text = "It's a beautiful scene of a Polar bear mauling a family of penguins.";
		}
		else if (this.globeClicks == 1) {
			gworld.text = "Shake shake shake.";

		}
		
		this.globeClicks = (this.globeClicks + 1)%2;
	}
	
	this.updateTV = function() {
		if (this.tvClicks == 0) {
			gworld.text = "Through the static you hear a reporter saying something about a 'mysterious disappearance.'";
		}
		else if (this.tvClicks == 1) {
			gworld.text = "Through the static you hear another reporter saying something about a 'horrible machine of death.'";

		}
		else if (this.tvClicks == 2) {
			gworld.text = "Through the static you make out something on the news about kittens.";
		}
		
		this.tvClicks = (this.tvClicks+1)%3;	
	}
	
	this.basementClicks = 0;
	this.checkBasement = function() {
		if (this.has("inv_key_blue")){
			if (this.basementClicks == 0) {
				gworld.text = "The key fits, but the lock seems reluctant to give. Maybe you should try it again?";
				this.basementClicks++;
			}
			else {			
				changeAudio("music/track3",true);
				gworld.goto_scene("basement");
			}
		}
		else {
			if (this.basementClicks == 0)
				gworld.text = "You try to pull the door open, but the lock won't budge.<br>Oh yeah, the lock is blue. That could be useful information.";
			else
				gworld.text = "Is the lock to keep you out.. or to keep something in?! Did I just blow your mind?";
			this.basementClicks = (this.basementClicks+1)%2;
		}
	}
	
	this.sharpClicks = 0;
	this.updateShapener = function() {
		if (this.has("inv_knife_dull")) {
			gworld.text = "You grind the blade of the DULL KNIFE until it is sharp enough to cut through stuff.<br><span style='color: #f7bc50'><i>You have SHARP KNIFE.</i></span>";
			var i;
			for (i = 0; i < this.inventory.length; ++i) {
  				if (this.inventory[i] == "inv_knife_dull") {
  					this.inventory[i] = "inv_knife_sharp";
  					var inv, img;
				  	if (this.inventoryid) {
					    inv = document.getElementById(this.inventoryid);
				    	img = inv.getElementsByTagName("img");
				    	img[i].src= IMG_PATH + "inv_knife_sharp" + IMG_EXTENSION;
				    	img[i].alt="A sharp knife"
				    	img[i].title="A sharp knife"
				  	}
				  	break;
  				}
			}
  		}
  		else if (this.has("inv_knife_sharp")){
  			if (this.sharpClicks == 0)
	  			gworld.text = "Your knife is already as sharp as my wit. Razor. Sharp.";
	  		else
	  			gworld.text = "Get Sharp";
	  		this.sharpClicks = (this.sharpClicks+1)%2;
  		}
		else {
			if (this.sharpClicks == 0)
				gworld.text = "Plenty of knife sharpeners, but not a knife in sight.";
  		else
	  			gworld.text = "Get Sharp";
	  		this.sharpClicks = (this.sharpClicks+1)%2;
  	
		}
	}
	
	this.cheeseClicks = 0;
	this.dullcheeseClicks = 0;
	this.updateCheese = function() {
		if (this.has("inv_happy")){
			if (this.cheeseClicks == 0) {
				gworld.text = "Sure, have some more cheese.. if it makes you feel Gouda."
			}
			else if (this.cheeseClicks == 1) {
				gworld.text = "Maybe you should let it Brie."
			}
			else if (this.cheeseClicks == 2) {
				gworld.text = "I see I have your un-feta'd attention."
			}
			else if (this.cheeseClicks == 3) {
				gworld.text = "Perhaps you Blue enough of your time here already."
			}
			else if (this.cheeseClicks == 4) {
				gworld.text = "I've used a bunch of cheese puns already, but there are Stilton of puns left."
			}
			else if (this.cheeseClicks == 5) {
				gworld.text = "Cheesus Christ.. make the puns stop!"
			}
			else if (this.cheeseClicks == 6) {
				gworld.text = "This could be the cheesiest text I've ever written."
			}
			else {
				gworld.text = "Truth or dairy."
			}
			this.cheeseClicks = (this.cheeseClicks+1)%8;
			return;
		}
			
		if (this.has("inv_knife_dull")) {
			if (this.dullcheeseClicks)
				gworld.text = "That rusty knife is far too dull. You'd have better luck cutting it with your hand.";
			else
				gworld.text = "You fail to cut the cheese. Your knife is dull, and you aren't too sharp yourself.";
			this.dullcheeseClicks = (this.dullcheeseClicks+1)%2
		}
		else if (this.has("inv_knife_sharp")){
			this.addto_inventory("inv_happy","A happy");
			gworld.text = "You cut a perfect slice of cheese with the greatest of ease, tossing your savory reward into your mouthhole. It tastes like a warm summer day.<br><span style='color: #f7bc50'><i>You have A HAPPY.</i></span>";
		}
		else {
			gworld.text = "The cheese looks delicious, but you don't have anything with which to cut it.";
		}
	}
	
	this.stoveClicks = 0;
	this.updateStove = function() {
		if (this.stoveClicks)
			gworld.text = "Needs more salt.";
		else
			gworld.text = "Hmmm.. smells like burnt tomato sauce.";
		
		this.stoveClicks = (this.stoveClicks+1)%2;
	}
	
	this.mayoClicks=0;
	this.mayo = function() {
		if (this.has("inv_key_red")) {
			if (this.mayoClicks)
				gworld.text = "Mmmmm, delicious mayo.";
			else
				gworld.text = "Mayo goes with everything.";
			
			this.mayoClicks = (this.mayoClicks+1)%2;
			return;
		}
		
		this.addto_inventory("inv_key_red","A red key");
		gworld.text = "You shovel several mouthfuls of mayonnaise down your throat, almost choking on a key that someone must have hidden in the jar.<br><span style='color: #f7bc50'><i>You have RED KEY.</i></span>"
	}
	this.ewgross = function() {
		
		if (this.ewClicks == 0) {
			gworld.text = "Ew, gross!";
		}
		else if (this.ewClicks == 1) {
			gworld.text = "Gag me with a spoon...as long as it doesn't have ketchup on it!";
		}
		else if (this.ewClicks == 2) {
			gworld.text = "Bleegh!";
		}
		else if (this.ewClicks == 3) {
			gworld.text = "Really? REALLY?";
		}		
		
		this.ewClicks = (this.ewClicks+1)%4;
		
	}
	
	this.towelClicks = 0;
	this.updateTowel = function() {
		if (this.towelClicks == 0)
			gworld.text = "You lick the towel"
		else
			gworld.text = "You lick the towel, again."
		this.towelClicks = (this.towelClicks+1)%2;
	}

	this.tubClicks = 0;
	this.updateBathtub = function(){
		if (this.has("inv_tread")){
			if (this.tubClicks == 0)
				gworld.text = "Now is not the time for a shower.<br>Well...a quick shower couldn't hurt.<br>Wait, no! This is definitely not the time!";
			else
				gworld.text = "Looks like someone left a kidney in there.";
			this.tubClicks = (this.tubClicks+1)%2;
			return;
		}
		this.addto_inventory("inv_tread","Tank treads");
		var hall = document.getElementById("hallway");
		var i;
		areas = hall.getElementsByTagName('area');
		for (i=0; i < areas.length; ++i) {
			if (areas[i].getAttribute("targetscene") == "bathroom"){
				areas[i].setAttribute("onClick","gworld.goto_scene(\'bathroom2\');gworld.update();");
			}
		}
		gworld.goto_scene("bathroom2");
		gworld.text = "It appears to be all-purpose tank treads. These could come in handy...<br><span style='color: #f7bc50'><i>You have TANK TREADS</i></span>."

	}
	
	this.kidClicks = 0;
	this.updateKidBed = function() {
		if (this.has("inv_knife_small")) {
			if (this.kidClicks)
				gworld.text = "The bed is too small."
			else
				gworld.text = "A bed of skulls."
				
			this.kidClicks = (this.kidClicks+1)%2;				
		}
		else {
			this.addto_inventory("inv_knife_small","A small knife");
			gworld.text = "You pick up the small pillow and hold it closely. Its squishiness reminds you of your childhood stuffed teddy bear, Butters. As you squeeze it tightly, a tiny knife pops out from its cottony bosom.<br><span style='color: #f7bc50'><i>You have SMALL KNIFE.</i></span>";
		}
	}
	
	this.bedClicks = 0;
	this.updateBed = function() {
		if (this.has("inv_knife_green")){
			if (this.bedClicks)
				gworld.text = "You can sleep when you are dead.. in about fifteen minutes from now..";
			else
				gworld.text = "These sheets would look nice with a fancy skull print."
			
			this.bedClicks = (this.bedClicks+1)%2
		}
		else {
			this.addto_inventory("inv_knife_green","A green knife");
			gworld.text = "As you climb between the sheetholes you feel something poking against your thigh. To your surprise, you find a green-ish knife under the sheets. As usual, you are disappointed it isn't a Dorito chip.<br><span style='color: #f7bc50'><i>You have GREEN-ISH KNIFE.</i></span>";
		}
	}

	this.drawerClicks = 0;
	this.updateLeftDrawer = function() {
		if (this.has("inv_knife_yellow")){
			if (this.drawerClicks)
				gworld.text = "There's nothing of note in here.";
			else
				gworld.text = "It was a dark and drawery night.";
			this.drawerClicks = (this.drawerClicks+1)%2;
		}
		else {
			this.addto_inventory("inv_knife_yellow","A yellow knife");
			gworld.text =  "You find a knife hidden under a bible.<br><span style='color: #f7bc50'><i>You have YELLOW KNIFE.</i></span>";
		}
	}
	

	this.updateRightDrawer = function() {
		if (this.has("inv_knife_big")){
			if (this.drawerClicks)
				gworld.text = "There's nothing of note in here.";
			else
				gworld.text = "There are probably easier ways to get into someone's drawers.";
				
			this.drawerClicks = (this.drawerClicks+1)%2;
		}
		else {
			this.addto_inventory("inv_knife_big","A big knife");
			gworld.text =  "You find a bible. It was hidden under a very large knife.<br><span style='color: #f7bc50'><i>You have VERY LARGE KNIFE.</i></span>";
		}
	}
	
	this.closetClicks = 0;
	this.updateClothing = function() {
		if (this.has("inv_key_red")){
			gworld.goto_scene("secretroom");
		}
		else{
			if (this.closetClicks)
				gworld.text = "The wall behind the clothes feels a little flimsy.";
			else
				gworld.text = "No bogeyman in here."
			this.closetClicks = (this.closetClicks+1)%2;
		}
	}
	
	this.dollClicks = 0;
	this.updateDolls = function() {	
		if (this.dollClicks == 0) {
			gworld.text = "That's one way to get ahead in life.";
		}
		else if (this.dollClicks == 1) {
			gworld.text = "These headless dolls give girls unrealistic expectations about their bodies.";

		}
		else
			gworld.text = "No-body knows the troubles I've seen.";
			
		this.dollClicks = (this.dollClicks+1)%3
		
	}

	this.updateLeftDoll = function() {
		if (this.has("inv_knife_argyle")){
			this.updateDolls();
		}
		else {
			this.addto_inventory("inv_knife_argyle","An argyle knife");
			gworld.text = "You lift up one a headless doll, revealing an argyle knife.<br><span style='color: #f7bc50'><i>You have ARGYLE KNIFE.</i></span>"
		}
	}
	this.updateRightDoll = function() {
		if (this.has("inv_key_blue")){
			this.updateDolls();
		}
		else {
			this.addto_inventory("inv_key_blue","A blue key");
			gworld.text = "You pick up the doll's head and notice its surprising weight.<br>Suddenly, a key falls out from underneath it.<br><span style='color: #f7bc50'><i>You have BLUE KEY.</i></span>";
		}
	}
	
	this.doneDoor = false;
	this.doorClicks = 0;
	this.updateDoor = function() {
		if (this.doneDoor) {
			if (this.doorClicks == 0)
				gworld.text="That centipede is gone, man. Let it go.";
			else
				gworld.text="'Willkommen'? What a weird name.";
			this.doorClicks = (this.doorClicks+1)%2;
		}
		else {
			gworld.text ="You lift up the map and slide your hand underneath.<br>You grab what feels like a door key...but it's just a centipede.";
			this.doneDoor = true;
		}
	}
	
	this.updateBucket = function() {
		if (this.has("inv_knife_steak")) {
			gworld.text = "This hole is empty.";
		}
		else if (this.has("inv_steak")) {
			this.addto_inventory("inv_knife_steak","A steak knife");
			gworld.text = "You shove your hand back into the bucket and discover a steak knife.<br><span style='color: #f7bc50'><i>You have STEAK KNIFE.</i></span>" 

		}
		else {
			this.addto_inventory("inv_steak", "A steak");
			gworld.text = "You reach into the bucket and find a cold, wet, drippy piece of meat laying in it. Your mom will be so proud.<br><span style='color: #f7bc50'><i>You have DRIPPY STEAK.</i></span>"

		}
	}
	this.updateCautionDoor = function() {
		if (this.has("inv_sad") && this.has("inv_steak")){
			gworld.goto_scene("laboratory");
		}
		else if (!this.has("inv_sad") || !this.has("inv_steak")){
			if (this.sadCautionDoorClicks == 0){
				gworld.text = "There's a noise coming from behind the door. It sounds like.. clucking?";
				this.sadCautionDoorClicks++;
			}
			else {
				changeAudio("music/death",true);
				gworld.goto_scene("chickendeath");
			}
		}
	}
	this.updateBloodyDoor = function() {
		if (this.has("inv_rfid")){
			gworld.goto_scene("sacrifice");
		}
		else {
			gworld.text ="The door appears to be locked, but you don't see a keyhole.";
		}
	}
	this.updateCabinet = function() {
		if (this.has("inv_rfid")){
			if (this.cabinetClicks == 0){
				gworld.text="You see a medical file for patient 'Seymour Butts'.";
			}
			if (this.cabinetClicks == 1){
				gworld.text="You see a medical file for patient 'Oliver Klozoff'.";
			}
			if (this.cabinetClicks == 2) {
				gworld.text="You see a medical file for patient 'Amanda Huggenkiss'.";
			}
			this.cabinetClicks = (this.cabinetClicks+1)%3;
				
		}
		else{
			this.addto_inventory("inv_rfid","An RFID");
			gworld.text="As you search through rows of manilla folders, you discover a radio-controlled door opener.<br><span style='color: #f7bc50'><i>You have RFID CHIP.</i></span>";
		}
	}
	
	this.compClicks = 0;
	this.updateComputer = function() {
		if (this.compClicks == 0)
			gworld.text = "Weird. It looks like somebody had recently searched for 'knife + tank' on this computer.";
		else if (this.compClicks == 1)
			gworld.text = "You can update your Tumblr later.";
		else
			gworld.text = "BareLyinChick forgot to sign out of their Livejournal account."
		
		this.compClicks = (this.compClicks+1)%3;
	}
	this.updateSheets = function() {
		gworld.text = "This seems like it would be a great place to hide.";
	}
	
	this.sac2 = 0;
	this.updateSacrifice = function() {
		if (this.sac2 == 0)
			gworld.text = "As you approach the door you hear someone coming right for you. Quick, hide!";
		else
			gworld.text = "Find somewhere to hide!"
			
		this.sac2 = (this.sac2+1)%2;
		this.sacrificeClicks = 1;
	}
	this.updateSheets = function() {
		if (this.sacrificeClicks > 0){
			gworld.goto_scene("sheets");
		}
		else {
			gworld.text = "This seems like it would be a great place to hide.";
		}
	}
	
}