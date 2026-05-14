import bpy
import math
from mathutils import Vector


OUTPUT_PATH = "/Users/user/dev/hildr/assets/models/hildr.glb"
BLEND_OUTPUT_PATH = "/Users/user/dev/hildr/assets/models/hildr.blend"


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in (bpy.data.meshes, bpy.data.materials, bpy.data.images, bpy.data.cameras, bpy.data.lights):
        for block in collection:
            if block.users == 0:
                collection.remove(block)


def make_mat(name, color, roughness=0.7, metallic=0.1):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Specular IOR Level"].default_value = 0.34
    return mat


def parent_to_root(obj, root):
    obj.parent = root
    return obj


def shade_and_mod(obj, subd=0, bevel=0):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    try:
        bpy.ops.object.shade_smooth()
    finally:
        obj.select_set(False)
    if subd:
        mod = obj.modifiers.new(name="SoftShape", type="SUBSURF")
        mod.levels = subd
        mod.render_levels = subd
    if bevel:
        mod = obj.modifiers.new(name="SoftEdges", type="BEVEL")
        mod.width = bevel
        mod.segments = 2
    return obj


def make_ellipsoid(name, mat, loc, scale, root, segments=32, rings=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)
    parent_to_root(obj, root)
    shade_and_mod(obj)
    return obj


def make_box(name, mat, loc, scale, root, rotation=(0, 0, 0), bevel=0.015):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat)
    parent_to_root(obj, root)
    shade_and_mod(obj, bevel=bevel)
    return obj


def make_body_mesh(mat, root):
    # Blender-native Z-up mesh. Back is +Y, matching the reference view.
    segments = 14
    loops = [
        (0.94, 0.22, 0.13),
        (1.08, 0.34, 0.17),
        (1.28, 0.38, 0.19),
        (1.50, 0.27, 0.14),
        (1.72, 0.23, 0.13),
        (1.93, 0.31, 0.15),
        (2.12, 0.44, 0.17),
        (2.30, 0.20, 0.11),
    ]
    verts = []
    faces = []

    for z, rx, ry in loops:
        for i in range(segments):
            a = (i / segments) * math.tau
            x = math.cos(a) * rx
            y = math.sin(a) * ry
            if z > 1.9:
                x *= 1.08 if abs(math.cos(a)) > 0.55 else 1.0
            verts.append((x, y, z))

    for row in range(len(loops) - 1):
        for i in range(segments):
            a = row * segments + i
            b = row * segments + (i + 1) % segments
            c = (row + 1) * segments + (i + 1) % segments
            d = (row + 1) * segments + i
            faces.append((a, b, c, d))

    faces.append(tuple(reversed(range(segments))))
    top_start = (len(loops) - 1) * segments
    faces.append(tuple(top_start + i for i in range(segments)))

    mesh = bpy.data.meshes.new("FemaleBodyMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new("FemaleBody", mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    parent_to_root(obj, root)
    shade_and_mod(obj, subd=1)
    return obj


def make_tapered_limb(name, mat, points, radii, root, segments=12):
    verts = []
    faces = []

    for idx, point in enumerate(points):
        p = Vector(point)
        if idx == 0:
            direction = Vector(points[1]) - p
        elif idx == len(points) - 1:
            direction = p - Vector(points[idx - 1])
        else:
            direction = Vector(points[idx + 1]) - Vector(points[idx - 1])
        direction.normalize()

        reference = Vector((0, 0, 1))
        if abs(direction.dot(reference)) > 0.92:
            reference = Vector((0, 1, 0))
        u = direction.cross(reference)
        u.normalize()
        v = direction.cross(u)
        v.normalize()

        rx, ry = radii[idx]
        for i in range(segments):
            a = (i / segments) * math.tau
            verts.append(tuple(p + u * (math.cos(a) * rx) + v * (math.sin(a) * ry)))

    for row in range(len(points) - 1):
        for i in range(segments):
            a = row * segments + i
            b = row * segments + (i + 1) % segments
            c = (row + 1) * segments + (i + 1) % segments
            d = (row + 1) * segments + i
            faces.append((a, b, c, d))

    faces.append(tuple(reversed(range(segments))))
    top_start = (len(points) - 1) * segments
    faces.append(tuple(top_start + i for i in range(segments)))

    mesh = bpy.data.meshes.new(name + "Mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    parent_to_root(obj, root)
    shade_and_mod(obj, subd=1)
    return obj


def make_cape(mat, inner_mat, root):
    verts = [
        (0.10, 0.25, 2.12),
        (0.58, 0.28, 2.07),
        (0.10, 0.31, 1.56),
        (0.72, 0.42, 1.50),
        (0.12, 0.32, 0.88),
        (0.70, 0.44, 0.82),
        (0.18, 0.27, 0.10),
        (0.54, 0.36, 0.08),
    ]
    faces = [(0, 1, 3, 2), (2, 3, 5, 4), (4, 5, 7, 6)]
    mesh = bpy.data.meshes.new("CapeMesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    cape = bpy.data.objects.new("RedCape", mesh)
    bpy.context.collection.objects.link(cape)
    cape.data.materials.append(mat)
    cape.modifiers.new(name="CapeFlow", type="SUBSURF").levels = 1
    solid = cape.modifiers.new(name="CapeThickness", type="SOLIDIFY")
    solid.thickness = 0.018
    parent_to_root(cape, root)

    inner = cape.copy()
    inner.data = cape.data.copy()
    inner.name = "RedCapeInner"
    inner.location.y += 0.016
    inner.data.materials.clear()
    inner.data.materials.append(inner_mat)
    bpy.context.collection.objects.link(inner)
    parent_to_root(inner, root)

    highlight = cape.copy()
    highlight.data = cape.data.copy()
    highlight.name = "CapeBrightFace"
    highlight.location.x += 0.018
    highlight.location.y -= 0.012
    highlight.scale.x = 0.92
    highlight.data.materials.clear()
    highlight.data.materials.append(mat)
    bpy.context.collection.objects.link(highlight)
    parent_to_root(highlight, root)
    return cape


def create_rig(root):
    arm_data = bpy.data.armatures.new("HildrRigData")
    arm_obj = bpy.data.objects.new("HildrRig", arm_data)
    bpy.context.collection.objects.link(arm_obj)
    parent_to_root(arm_obj, root)
    bpy.context.view_layer.objects.active = arm_obj
    bpy.ops.object.mode_set(mode="EDIT")

    def add_bone(name, head, tail, parent=None):
        bone = arm_data.edit_bones.new(name)
        bone.head = Vector(head)
        bone.tail = Vector(tail)
        if parent:
            bone.parent = arm_data.edit_bones[parent]

    add_bone("Root", (0, 0, 0.18), (0, 0, 0.95))
    add_bone("Spine", (0, 0, 0.95), (0, 0, 1.9), "Root")
    add_bone("Head", (0, 0, 1.9), (0, 0, 2.42), "Spine")
    add_bone("Arm.L", (-0.2, 0, 1.95), (-0.58, -0.04, 1.2), "Spine")
    add_bone("Arm.R", (0.2, 0, 1.95), (0.58, -0.04, 1.2), "Spine")
    add_bone("Leg.L", (-0.17, 0, 0.98), (-0.17, 0, 0.1), "Root")
    add_bone("Leg.R", (0.17, 0, 0.98), (0.17, 0, 0.1), "Root")
    add_bone("Cape", (0.22, 0.21, 1.9), (0.42, 0.35, 0.35), "Spine")
    bpy.ops.object.mode_set(mode="OBJECT")
    return arm_obj


def make_face_features(mats, root):
    # Face points toward -Y; back/braid/cape are on +Y.
    for side in (-1, 1):
        eye_white = make_ellipsoid(
            "EyeWhite.L" if side < 0 else "EyeWhite.R",
            mats["eye_white"],
            (0.065 * side, -0.170, 2.61),
            (0.043, 0.013, 0.026),
            root,
            16,
            8,
        )
        eye_white.rotation_euler[2] = math.radians(5 * -side)

        iris = make_ellipsoid(
            "Iris.L" if side < 0 else "Iris.R",
            mats["iris"],
            (0.066 * side, -0.184, 2.608),
            (0.018, 0.006, 0.018),
            root,
            12,
            6,
        )
        iris.rotation_euler[2] = math.radians(5 * -side)

        brow = make_box(
            "Brow.L" if side < 0 else "Brow.R",
            mats["brow"],
            (0.065 * side, -0.178, 2.665),
            (0.052, 0.008, 0.010),
            root,
            rotation=(0, 0, math.radians(9 * -side)),
            bevel=0.004,
        )
        brow.rotation_euler[0] = math.radians(2)

        cheek = make_ellipsoid(
            "Cheek.L" if side < 0 else "Cheek.R",
            mats["skin_warm"],
            (0.086 * side, -0.155, 2.535),
            (0.038, 0.010, 0.026),
            root,
            12,
            6,
        )
        cheek.rotation_euler[2] = math.radians(7 * side)

        ear = make_ellipsoid(
            "Ear.L" if side < 0 else "Ear.R",
            mats["skin"],
            (0.198 * side, -0.006, 2.57),
            (0.032, 0.020, 0.060),
            root,
            14,
            8,
        )
        ear.rotation_euler[1] = math.radians(12 * side)

        front_lock = make_ellipsoid(
            "FrontHairLock.L" if side < 0 else "FrontHairLock.R",
            mats["hair"],
            (0.070 * side, -0.120, 2.69),
            (0.035, 0.018, 0.125),
            root,
            14,
            8,
        )
        front_lock.rotation_euler[2] = math.radians(12 * side)

    nose_bridge = make_ellipsoid(
        "NoseBridge",
        mats["skin_warm"],
        (0, -0.181, 2.565),
        (0.027, 0.018, 0.085),
        root,
        14,
        8,
    )
    nose_bridge.rotation_euler[0] = math.radians(-5)

    nose_tip = make_ellipsoid(
        "NoseTip",
        mats["skin_warm"],
        (0, -0.198, 2.535),
        (0.035, 0.019, 0.026),
        root,
        14,
        8,
    )

    upper_lip = make_box(
        "UpperLip",
        mats["lip"],
        (0, -0.188, 2.470),
        (0.060, 0.007, 0.010),
        root,
        rotation=(0, 0, math.radians(2)),
        bevel=0.005,
    )
    lower_lip = make_ellipsoid(
        "LowerLip",
        mats["lip"],
        (0, -0.186, 2.448),
        (0.052, 0.008, 0.014),
        root,
        12,
        6,
    )

    chin = make_ellipsoid(
        "Chin",
        mats["skin_warm"],
        (0, -0.115, 2.390),
        (0.075, 0.024, 0.030),
        root,
        14,
        8,
    )

    return [nose_bridge, nose_tip, upper_lip, lower_lip, chin]


def create_hildr():
    mats = {
        "skin": make_mat("Skin", (0.84, 0.66, 0.52), 0.68, 0.0),
        "skin_warm": make_mat("SkinWarm", (0.90, 0.70, 0.56), 0.70, 0.0),
        "leather": make_mat("LeatherArmor", (0.34, 0.22, 0.15), 0.83, 0.08),
        "dark_leather": make_mat("DarkLeather", (0.11, 0.07, 0.05), 0.86, 0.08),
        "fur": make_mat("Fur", (0.76, 0.66, 0.49), 0.96, 0.0),
        "cape": make_mat("CapeRed", (1.0, 0.02, 0.015), 0.58, 0.02),
        "cape_dark": make_mat("CapeInnerDark", (0.34, 0.025, 0.025), 0.72, 0.02),
        "steel": make_mat("Steel", (0.58, 0.62, 0.66), 0.35, 0.78),
        "hair": make_mat("BlondeHair", (0.95, 0.70, 0.32), 0.58, 0.04),
        "eye_white": make_mat("EyeWhite", (0.92, 0.90, 0.84), 0.42, 0.0),
        "iris": make_mat("IrisBlue", (0.12, 0.38, 0.62), 0.32, 0.0),
        "brow": make_mat("BrowBlonde", (0.62, 0.42, 0.18), 0.62, 0.0),
        "lip": make_mat("LipMutedRose", (0.54, 0.20, 0.17), 0.62, 0.0),
    }

    root = bpy.data.objects.new("HildrRoot", None)
    bpy.context.collection.objects.link(root)

    body = make_body_mesh(mats["leather"], root)
    body.rotation_euler[2] = math.radians(-3)

    head = make_ellipsoid("Head", mats["skin"], (0, -0.015, 2.58), (0.20, 0.165, 0.25), root)
    head.rotation_euler[2] = math.radians(2)
    make_ellipsoid("HairCap", mats["hair"], (0, 0.050, 2.64), (0.22, 0.185, 0.13), root, 28, 10)
    make_face_features(mats, root)

    for i in range(12):
        z = 2.44 - i * 0.15
        x = -0.018 if i % 2 else 0.018
        y = 0.240 + i * 0.009
        make_ellipsoid(f"BraidSegment.{i:02d}", mats["hair"], (x, y, z), (0.065, 0.047, 0.058), root, 18, 10)

    for side in (-1, 1):
        make_tapered_limb(
            "Arm.L" if side < 0 else "Arm.R",
            mats["leather"],
            [(0.42 * side, -0.015, 2.02), (0.54 * side, -0.02, 1.62), (0.50 * side, -0.02, 1.18)],
            [(0.09, 0.075), (0.075, 0.062), (0.058, 0.05)],
            root,
            14,
        )
        make_ellipsoid("FurShoulder.L" if side < 0 else "FurShoulder.R", mats["fur"], (0.39 * side, 0.03, 2.08), (0.16, 0.12, 0.13), root, 18, 10)
        make_box("Bracer.L" if side < 0 else "Bracer.R", mats["steel"], (0.50 * side, -0.02, 1.25), (0.09, 0.055, 0.12), root, bevel=0.01)

    for side in (-1, 1):
        make_tapered_limb(
            "Leg.L" if side < 0 else "Leg.R",
            mats["dark_leather"],
            [(0.18 * side, 0, 1.02), (0.18 * side, 0.005, 0.58), (0.15 * side, 0.005, 0.10)],
            [(0.105, 0.082), (0.086, 0.067), (0.060, 0.050)],
            root,
            14,
        )
        make_box("Boot.L" if side < 0 else "Boot.R", mats["dark_leather"], (0.15 * side, -0.07, 0.06), (0.10, 0.23, 0.075), root, bevel=0.025)

    for i, x in enumerate((-0.32, -0.20, -0.08, 0.04, 0.16, 0.28, 0.40)):
        make_ellipsoid(f"FurTuft.{i:02d}", mats["fur"], (x, 0.03, 2.00 + 0.03 * math.sin(i)), (0.085, 0.070, 0.060), root, 14, 8)

    for i, x in enumerate((-0.24, -0.08, 0.08, 0.24)):
        panel = make_box(f"LeatherSkirt.{i:02d}", mats["dark_leather"], (x, -0.02, 0.88), (0.075, 0.035, 0.36), root, rotation=(0, 0, math.radians(4 * (i - 1.5))), bevel=0.012)
        panel.rotation_euler[0] = math.radians(6)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.29, minor_radius=0.032, location=(0, 0, 1.17), rotation=(math.radians(90), 0, 0))
    belt = bpy.context.object
    belt.name = "Belt"
    belt.data.materials.append(mats["steel"])
    parent_to_root(belt, root)

    make_box("BackStrap", mats["dark_leather"], (0.07, 0.20, 1.58), (0.035, 0.025, 0.58), root, rotation=(math.radians(19), 0, math.radians(-28)), bevel=0.008)
    make_box("Sword", mats["steel"], (0.36, 0.22, 1.08), (0.025, 0.035, 0.60), root, rotation=(math.radians(18), math.radians(-8), math.radians(34)), bevel=0.006)

    make_cape(mats["cape"], mats["cape_dark"], root)
    create_rig(root)
    return root


def export():
    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_PATH,
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        use_selection=False,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
    )


clear_scene()
create_hildr()
bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUTPUT_PATH)
export()
print(f"Exported model to: {OUTPUT_PATH}")
print(f"Saved source blend to: {BLEND_OUTPUT_PATH}")
