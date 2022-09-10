<template>
    <input
      ref="radioRef"
      v-model="modelValue"
      :class="ns.be('button', 'original-radio')"
      :value="label"
      type="radio"
      :name="name || radioGroup?.name"
      :disabled="disabled"
      @focus="focus = true"
      @blur="focus = false"
    />
      <slot>
        {{ label }}
      </slot>
    </input>
</template>
<script lang="ts" setup>

</script>