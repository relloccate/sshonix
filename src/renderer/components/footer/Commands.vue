<template>
    <div class="commands">
        <CommandSvg />
    </div>
</template>
<script>
import CommandSvg from 'front/svg/command.svg';

export default {
    components: { CommandSvg }
};
</script>
<style lang="postcss" scoped>
.commands {
    margin-left: auto;
    cursor: pointer;
    user-select: none;
    display: flex;
    font-size: 0.85em;
    font-weight: 600;
    align-items: center;
    color: color-mod(var(--dark-white-color) a(85%));
    animation: fade-up 0.3s var(--ease);
    /* padding: 0 2em; */
}

svg {
    width: 1.25rem;
    min-width: 1.25rem;
    height: 1.25rem;
    margin-right: 1em;
    fill: color-mod(var(--dark-white-color) a(85%));
}
</style>
