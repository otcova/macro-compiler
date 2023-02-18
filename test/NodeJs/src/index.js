
//!start if target == NodeJs
import { myFunction } from "./nodejs-specific.js";
//!end

export default function() {
	const compatibleModule = myFunction();
	

	//!start if target == NodeJs
	if (compatibleModule.includes("NodeJs")) {
		const irrevelantText = 'greger //!end fwg';
		return "NodeJs";
	}
	//!end
}
