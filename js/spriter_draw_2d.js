"use strict";

var fo = fo || {};

/**
 * @constructor
 * @param {HTMLCanvasElement} canvas_2d 
 */
fo.view_2d = function(canvas_2d) {
	this.ctx_2d = canvas_2d.getContext('2d');
}

/**
 * @return {void} 
 * @param {spriter.pose} pose 
 */
fo.view_2d.prototype.debug_draw_pose_2d = function(pose) {
	var ctx_2d = this.ctx_2d;

	pose.strike();

	if (pose.m_data && pose.m_data.folder_array) {
		// draw objects
		var folder_array = pose.m_data.folder_array;
		var object_array = pose.m_tweened_object_array;
		for (var object_idx = 0, object_len = object_array.length; object_idx < object_len; ++object_idx) {
			var object = object_array[object_idx];
			var folder = folder_array[object.folder];
			var file = folder.file_array[object.file];

			ctx_2d.save();

			// apply object transform
			ctx_2d.translate(object.x, object.y);
			ctx_2d.rotate(object.angle * Math.PI / 180);
			ctx_2d.scale(object.scale_x, object.scale_y);

			// image extents
			var ex = 0.5 * file.width;
			var ey = 0.5 * file.height;
			//ctx_2d.scale(ex, ey);

			// local pivot in unit (-1 to +1) coordinates
			var lpx = (object.pivot_x * 2) - 1;
			var lpy = (object.pivot_y * 2) - 1;
			//ctx_2d.translate(-lpx, -lpy);
			ctx_2d.translate(-lpx*ex, -lpy*ey);

			ctx_2d.scale(1, -1); // -y for canvas space

			ctx_2d.fillStyle = 'rgba(127,127,127,0.5)';
			//ctx_2d.fillRect(-1, -1, 2, 2);
			ctx_2d.fillRect(-ex, -ey, 2*ex, 2*ey);

			ctx_2d.beginPath();
			ctx_2d.moveTo(0, 0);
			ctx_2d.lineTo(32, 0);
			ctx_2d.lineWidth = 2;
			ctx_2d.lineCap = 'round';
			ctx_2d.strokeStyle = 'rgba(127,0,0,0.5)';
			ctx_2d.stroke();

			ctx_2d.beginPath();
			ctx_2d.moveTo(0, 0);
			ctx_2d.lineTo(0, -32);
			ctx_2d.lineWidth = 2;
			ctx_2d.lineCap = 'round';
			ctx_2d.strokeStyle = 'rgba(0,127,0,0.5)';
			ctx_2d.stroke();

			ctx_2d.restore();
		}

		// draw bone hierarchy
		var bone_array = pose.m_tweened_bone_array;
		for (var bone_idx = 0, bone_len = bone_array.length; bone_idx < bone_len; ++bone_idx) {
			var bone = bone_array[bone_idx];

			var parent_index = bone.parent;
			if (parent_index >= 0) {
				var parent_bone = bone_array[parent_index];

				ctx_2d.save();

				ctx_2d.beginPath();
				ctx_2d.moveTo(bone.x, bone.y);
				ctx_2d.lineTo(parent_bone.x, parent_bone.y);
				ctx_2d.lineWidth = 2;
				ctx_2d.lineCap = 'round';
				ctx_2d.strokeStyle = 'grey';
				ctx_2d.stroke();

				ctx_2d.restore();
			}
		}

		// draw bones
		var bone_array = pose.m_tweened_bone_array;
		for (var bone_idx = 0, bone_len = bone_array.length; bone_idx < bone_len; ++bone_idx) {
			var bone = bone_array[bone_idx];

			ctx_2d.save();

			// apply bone transform
			ctx_2d.translate(bone.x, bone.y);
			ctx_2d.rotate(bone.angle * Math.PI / 180);

			ctx_2d.beginPath();
			ctx_2d.moveTo(0, 0);
			ctx_2d.lineTo(bone.scale_x * 32, 0);
			ctx_2d.lineWidth = 2;
			ctx_2d.lineCap = 'round';
			ctx_2d.strokeStyle = 'red';
			ctx_2d.stroke();

			ctx_2d.beginPath();
			ctx_2d.moveTo(0, 0);
			ctx_2d.lineTo(0, bone.scale_y * 32);
			ctx_2d.lineWidth = 2;
			ctx_2d.lineCap = 'round';
			ctx_2d.strokeStyle = 'green';
			ctx_2d.stroke();

			ctx_2d.restore();
		}
	}
}

/**
 * @return {void} 
 * @param {spriter.pose} pose 
 */

fo.view_2d.prototype.draw_pose_2d = function(pose, pos_data) {
	var ctx_2d = this.ctx_2d;

	pose.strike();

	if (pose.m_data && pose.m_data.folder_array) {
		var folder_array = pose.m_data.folder_array;
		var object_array = pose.m_tweened_object_array;
		for (var object_idx = 0, object_len = object_array.length; object_idx < object_len; ++object_idx) {
			var object = object_array[object_idx];
			var folder = folder_array[object.folder];
			var file = folder.file_array[object.file];

			ctx_2d.save();

			var angle_rads = (pos_data.angle*pos_data.flip) * Math.PI / 180;
			var scale_x = pos_data.scale_x*pos_data.flip;
			var scale_y = pos_data.scale_y;
			var pos_x = pos_data.pos_x;
			var pos_y = pos_data.pos_y;
			var object_x = Math.cos(angle_rads) * (object.x - object.pivot_x) - Math.sin(angle_rads) * (object.y-object.pivot_y) + object.pivot_x;
			var object_y = Math.sin(angle_rads) * (object.x - object.pivot_x) + Math.cos(angle_rads) * (object.y-object.pivot_y) + object.pivot_y;
			// apply object transform
			ctx_2d.translate(object_x*scale_x+pos_x, object_y*scale_y-pos_y);
			ctx_2d.rotate((object.angle*pos_data.flip * Math.PI / 180) + angle_rads);
			ctx_2d.scale(object.scale_x*scale_x, object.scale_y*scale_y);

			// image extents
			var ex = 0.5 * file.width;
			var ey = 0.5 * file.height;
			//ctx_2d.scale(ex, ey);

			// local pivot in unit (-1 to +1) coordinates
			var lpx = (object.pivot_x * 2) - 1;
			var lpy = (object.pivot_y * 2) - 1;
			//ctx_2d.translate(-lpx, -lpy);
			ctx_2d.translate(-lpx*ex, -lpy*ey);

			if (file.image && !file.image.hidden) {
				ctx_2d.scale(1, -1); // -y for canvas space

				ctx_2d.globalAlpha = object.a;

				//ctx_2d.drawImage(file.image, -1, -1, 2, 2);
				ctx_2d.drawImage(file.image, -ex, -ey, 2*ex, 2*ey);
			}
			else {
				ctx_2d.fillStyle = 'rgba(127,127,127,0.5)';
				//ctx_2d.fillRect(-1, -1, 2, 2);
				ctx_2d.fillRect(-ex, -ey, 2*ex, 2*ey);
			}

			ctx_2d.restore();
		}
	}
}
