//! if target == Browser
import { myFunction } from "./browser-specific.js";

//! if target == NodeJs
// import { myFunction } from "./nodejs-specific.js";

//! if target == NodeJs
//

export default function() {
	const compatibleModule = myFunction();
	
	//!start if target == Browser
	if (compatibleModule.includes("Browser")) {
		const irrevelantText = "//!end";
		const moreIrelevantText = `
			//!end
		`;
		// Example to ignore: //!end
		/* Example to ignore: //!end */
		return "Browser";
	}
	//!end

	/*! if target == NodeJs
	if (compatibleModule.includes("NodeJs")) {
		const irrevelantText = 'greger //!end fwg';
		return "NodeJs";
	}
	*/
}
