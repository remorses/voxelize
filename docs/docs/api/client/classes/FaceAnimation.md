---
id: "FaceAnimation"
title: "Class: FaceAnimation"
sidebar_label: "FaceAnimation"
sidebar_position: 0
custom_edit_url: null
---

## Constructors

### constructor

• **new FaceAnimation**(`range`, `keyframes`, `fadeFrames?`)

Create a new face animation. This holds the data and will be used to draw on the texture atlas.

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `range` | [`TextureRange`](../modules.md#texturerange-38) | `undefined` | The range of the texture atlas that this animation uses. |
| `keyframes` | [`number`, `HTMLImageElement` \| `Color`][] | `undefined` | The keyframes of the animation. This will be queried and drawn to the texture atlas. |
| `fadeFrames` | `number` | `0` | The fading duration between each keyframe in milliseconds. |

## Properties

### fadeFrames

• **fadeFrames**: `number`

The fading duration between each keyframe in milliseconds.

___

### keyframes

• **keyframes**: [`number`, `HTMLImageElement` \| `Color`][]

The keyframes of the animation. This will be queried and drawn to the
texture atlas.

___

### range

• **range**: [`TextureRange`](../modules.md#texturerange-38)

The range of the texture atlas that this animation uses.