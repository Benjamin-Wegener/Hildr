import bpy
import math
from mathutils import Vector


SOURCE_GLB = "/Users/user/dev/hildr/assets/models/shieldmaiden.glb"
OUTPUT_BLEND = "/Users/user/dev/hildr/assets/models/shieldmaiden_rigged.blend"
OUTPUT_GLB = "/Users/user/dev/hildr/assets/models/shieldmaiden_rigged.glb"


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def import_model():
    bpy.ops.import_scene.gltf(filepath=SOURCE_GLB)
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("No mesh objects were imported from the source GLB.")
    return meshes


def world_bounds(objects):
    points = []
    for obj in objects:
        for corner in obj.bound_box:
            points.append(obj.matrix_world @ Vector(corner))

    min_v = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    max_v = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    return min_v, max_v


def add_bone(armature, name, head, tail, parent=None):
    bone = armature.edit_bones.new(name)
    bone.head = Vector(head)
    bone.tail = Vector(tail)
    if parent:
        bone.parent = armature.edit_bones[parent]
        bone.use_connect = False
    return bone


def create_armature_for_bounds(min_v, max_v):
    center = (min_v + max_v) * 0.5
    size = max_v - min_v
    h = size.z
    width = size.x
    depth = size.y

    cx, cy = center.x, center.y
    z0 = min_v.z

    hip_z = z0 + h * 0.47
    waist_z = z0 + h * 0.58
    chest_z = z0 + h * 0.74
    neck_z = z0 + h * 0.86
    head_z = z0 + h * 0.96
    foot_z = z0 + h * 0.03
    knee_z = z0 + h * 0.27
    ankle_z = z0 + h * 0.09

    shoulder_x = max(width * 0.22, h * 0.08)
    hip_x = max(width * 0.085, h * 0.045)
    hand_x = max(width * 0.36, h * 0.16)
    elbow_x = max(width * 0.29, h * 0.12)
    foot_x = max(width * 0.07, h * 0.035)

    bpy.ops.object.armature_add(location=(0, 0, 0))
    arm_obj = bpy.context.object
    arm_obj.name = "ShieldmaidenRig"
    arm_obj.data.name = "ShieldmaidenRigData"
    arm_obj.show_in_front = True

    bpy.ops.object.mode_set(mode="EDIT")
    arm_obj.data.edit_bones.remove(arm_obj.data.edit_bones[0])

    add_bone(arm_obj.data, "Hips", (cx, cy, hip_z), (cx, cy, waist_z))
    add_bone(arm_obj.data, "Spine", (cx, cy, waist_z), (cx, cy, chest_z), "Hips")
    add_bone(arm_obj.data, "Chest", (cx, cy, chest_z), (cx, cy, neck_z), "Spine")
    add_bone(arm_obj.data, "Neck", (cx, cy, neck_z), (cx, cy, z0 + h * 0.90), "Chest")
    add_bone(arm_obj.data, "Head", (cx, cy, z0 + h * 0.90), (cx, cy, head_z), "Neck")

    for side_name, sign in (("L", -1), ("R", 1)):
        sx = cx + shoulder_x * sign
        hx = cx + hip_x * sign
        ex = cx + elbow_x * sign
        wx = cx + hand_x * sign
        fx = cx + foot_x * sign

        add_bone(arm_obj.data, f"UpperArm.{side_name}", (sx, cy, chest_z), (ex, cy - depth * 0.02, z0 + h * 0.62), "Chest")
        add_bone(arm_obj.data, f"Forearm.{side_name}", (ex, cy - depth * 0.02, z0 + h * 0.62), (wx, cy - depth * 0.03, z0 + h * 0.43), f"UpperArm.{side_name}")
        add_bone(arm_obj.data, f"Hand.{side_name}", (wx, cy - depth * 0.03, z0 + h * 0.43), (wx, cy - depth * 0.04, z0 + h * 0.36), f"Forearm.{side_name}")

        add_bone(arm_obj.data, f"Thigh.{side_name}", (hx, cy, hip_z), (cx + hip_x * 0.88 * sign, cy, knee_z), "Hips")
        add_bone(arm_obj.data, f"Shin.{side_name}", (cx + hip_x * 0.88 * sign, cy, knee_z), (fx, cy, ankle_z), f"Thigh.{side_name}")
        add_bone(arm_obj.data, f"Foot.{side_name}", (fx, cy, ankle_z), (fx, cy - depth * 0.22, foot_z), f"Shin.{side_name}")

    add_bone(
        arm_obj.data,
        "Cape",
        (cx + shoulder_x * 0.40, cy + depth * 0.30, chest_z),
        (cx + shoulder_x * 0.55, cy + depth * 0.42, z0 + h * 0.18),
        "Chest",
    )

    bpy.ops.object.mode_set(mode="OBJECT")
    return arm_obj


def try_bind_with_auto_weights(meshes, armature):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in meshes:
        obj.select_set(True)
    armature.select_set(True)
    bpy.context.view_layer.objects.active = armature

    try:
        bpy.ops.object.parent_set(type="ARMATURE_AUTO")
        has_skin = all(
            any(mod.type == "ARMATURE" and mod.object == armature for mod in obj.modifiers)
            and len(obj.vertex_groups) > 0
            for obj in meshes
        )
        return has_skin
    except Exception as error:
        print(f"Automatic weights failed, falling back to region weights: {error}")
        return False


def add_region_weights(meshes, armature, min_v, max_v):
    size = max_v - min_v
    h = max(size.z, 0.001)
    center = (min_v + max_v) * 0.5

    bone_names = [bone.name for bone in armature.data.bones]

    for obj in meshes:
        for group in list(obj.vertex_groups):
            obj.vertex_groups.remove(group)

        for mod in list(obj.modifiers):
            if mod.type == "ARMATURE":
                obj.modifiers.remove(mod)

        for name in bone_names:
            obj.vertex_groups.new(name=name)

        mod = obj.modifiers.new("ShieldmaidenRig", "ARMATURE")
        mod.object = armature
        obj.parent = armature

        for vertex in obj.data.vertices:
            world = obj.matrix_world @ vertex.co
            z = (world.z - min_v.z) / h
            x_side = "L" if world.x < center.x else "R"
            side_distance = abs(world.x - center.x) / max(size.x, 0.001)

            if side_distance > 0.23 and z > 0.36:
                if z > 0.60:
                    bone = f"UpperArm.{x_side}"
                elif z > 0.43:
                    bone = f"Forearm.{x_side}"
                else:
                    bone = f"Hand.{x_side}"
            elif z < 0.10:
                bone = f"Foot.{x_side}"
            elif z < 0.30:
                bone = f"Shin.{x_side}"
            elif z < 0.50:
                bone = f"Thigh.{x_side}"
            elif z < 0.60:
                bone = "Hips"
            elif z < 0.76:
                bone = "Spine"
            elif z < 0.87:
                bone = "Chest"
            elif z < 0.91:
                bone = "Neck"
            else:
                bone = "Head"

            obj.vertex_groups[bone].add([vertex.index], 1.0, "REPLACE")


def prepare_pose_bones(armature):
    bpy.context.view_layer.objects.active = armature
    armature.select_set(True)
    bpy.ops.object.mode_set(mode="POSE")

    for bone in armature.pose.bones:
        bone.rotation_mode = "XYZ"
        bone.rotation_euler = (0, 0, 0)
        bone.location = (0, 0, 0)
        bone.scale = (1, 1, 1)


def reset_pose(armature):
    for bone in armature.pose.bones:
        bone.rotation_euler = (0, 0, 0)
        bone.location = (0, 0, 0)
        bone.scale = (1, 1, 1)


def key_rotation(armature, bone_names, frame):
    for name in bone_names:
        armature.pose.bones[name].keyframe_insert(data_path="rotation_euler", frame=frame)


def key_location(armature, bone_names, frame):
    for name in bone_names:
        armature.pose.bones[name].keyframe_insert(data_path="location", frame=frame)


def start_action(armature, name):
    prepare_pose_bones(armature)
    armature.animation_data_create()
    action = bpy.data.actions.new(name)
    armature.animation_data.action = action
    return action


def finish_action(armature, action, end_frame):
    # Blender 5 stores new actions in the layered animation API. Older builds
    # expose fcurves directly; add cycles there, otherwise rely on identical
    # first/last poses plus Three.js LoopRepeat at runtime.
    for fcurve in getattr(action, "fcurves", []):
        fcurve.modifiers.new(type="CYCLES")

    track = armature.animation_data.nla_tracks.new()
    track.name = action.name
    strip = track.strips.new(action.name, 1, action)
    strip.name = action.name
    strip.frame_start = 1
    strip.frame_end = end_frame
    strip.blend_type = "REPLACE"
    strip.extrapolation = "NOTHING"
    armature.animation_data.action = None
    bpy.ops.object.mode_set(mode="OBJECT")


def add_idle_animation(armature):
    action = start_action(armature, "IdleBreath")
    bones = ("Spine", "Chest", "Head", "Cape")

    for frame, breath in ((1, 0.0), (24, 1.0), (48, 0.0)):
        bpy.context.scene.frame_set(frame)
        reset_pose(armature)
        armature.pose.bones["Spine"].rotation_euler[0] = math.radians(1.5 * breath)
        armature.pose.bones["Chest"].rotation_euler[0] = math.radians(2.2 * breath)
        armature.pose.bones["Head"].rotation_euler[2] = math.radians(1.0 * breath)
        armature.pose.bones["Cape"].rotation_euler[0] = math.radians(-3.0 * breath)

        key_rotation(armature, bones, frame)

    finish_action(armature, action, 48)


def add_walk_animation(armature):
    action = start_action(armature, "Walk")
    rotate_bones = (
        "Hips",
        "Spine",
        "Chest",
        "Head",
        "Cape",
        "UpperArm.L",
        "Forearm.L",
        "Hand.L",
        "UpperArm.R",
        "Forearm.R",
        "Hand.R",
        "Thigh.L",
        "Shin.L",
        "Foot.L",
        "Thigh.R",
        "Shin.R",
        "Foot.R",
    )

    # Five contact/passing poses make a compact loop that still reads clearly
    # through the broad vertex groups of the generated GLB.
    poses = (
        (1, 1.0, 0.00, 0.00, 0.0),
        (9, 0.0, 1.00, 0.25, 1.0),
        (17, -1.0, 0.00, 0.00, 0.0),
        (25, 0.0, 0.25, 1.00, -1.0),
        (33, 1.0, 0.00, 0.00, 0.0),
    )

    for frame, stride, left_lift, right_lift, sway in poses:
        bpy.context.scene.frame_set(frame)
        reset_pose(armature)

        hips = armature.pose.bones["Hips"]
        spine = armature.pose.bones["Spine"]
        chest = armature.pose.bones["Chest"]
        head = armature.pose.bones["Head"]
        cape = armature.pose.bones["Cape"]

        hips.location.z = 0.018 * max(left_lift, right_lift)
        hips.rotation_euler[2] = math.radians(2.0 * sway)
        spine.rotation_euler[2] = math.radians(-1.5 * sway)
        chest.rotation_euler[1] = math.radians(1.8 * stride)
        head.rotation_euler[2] = math.radians(-0.8 * sway)
        cape.rotation_euler[0] = math.radians(-4.0 - 5.0 * max(left_lift, right_lift))
        cape.rotation_euler[2] = math.radians(-2.5 * sway)

        left_leg = stride
        right_leg = -stride

        armature.pose.bones["Thigh.L"].rotation_euler[0] = math.radians(-21.0 * left_leg + 8.0 * left_lift)
        armature.pose.bones["Shin.L"].rotation_euler[0] = math.radians(8.0 + 22.0 * left_lift + 6.0 * max(0.0, -left_leg))
        armature.pose.bones["Foot.L"].rotation_euler[0] = math.radians(-7.0 * left_leg - 9.0 * left_lift)

        armature.pose.bones["Thigh.R"].rotation_euler[0] = math.radians(-21.0 * right_leg + 8.0 * right_lift)
        armature.pose.bones["Shin.R"].rotation_euler[0] = math.radians(8.0 + 22.0 * right_lift + 6.0 * max(0.0, -right_leg))
        armature.pose.bones["Foot.R"].rotation_euler[0] = math.radians(-7.0 * right_leg - 9.0 * right_lift)

        armature.pose.bones["UpperArm.L"].rotation_euler[0] = math.radians(13.0 * left_leg)
        armature.pose.bones["Forearm.L"].rotation_euler[0] = math.radians(4.0 + 8.0 * abs(left_leg))
        armature.pose.bones["Hand.L"].rotation_euler[2] = math.radians(-2.0 * sway)

        armature.pose.bones["UpperArm.R"].rotation_euler[0] = math.radians(13.0 * right_leg)
        armature.pose.bones["Forearm.R"].rotation_euler[0] = math.radians(4.0 + 8.0 * abs(right_leg))
        armature.pose.bones["Hand.R"].rotation_euler[2] = math.radians(-2.0 * sway)

        key_rotation(armature, rotate_bones, frame)
        key_location(armature, ("Hips",), frame)

    finish_action(armature, action, 33)


def export_assets():
    bpy.ops.wm.save_as_mainfile(filepath=OUTPUT_BLEND)
    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_GLB,
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_animations=True,
        export_materials="EXPORT",
        export_texcoords=True,
        export_normals=True,
    )


clear_scene()
mesh_objects = import_model()
min_bound, max_bound = world_bounds(mesh_objects)
rig = create_armature_for_bounds(min_bound, max_bound)

# The AI mesh often defeats Blender's heat weighting. Always write a broad,
# deterministic humanoid weighting pass so the GLB exports with a real skin.
try_bind_with_auto_weights(mesh_objects, rig)
add_region_weights(mesh_objects, rig, min_bound, max_bound)

add_idle_animation(rig)
add_walk_animation(rig)
export_assets()
print(f"Created rigged Blender source: {OUTPUT_BLEND}")
print(f"Created rigged GLB: {OUTPUT_GLB}")
