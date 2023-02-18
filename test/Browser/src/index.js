//! if target == Browser
import { myFunction } from "./browser-specific.js";


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

}
