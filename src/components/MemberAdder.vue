<template>
  <h3
    class="member-adder"
    contenteditable="true"
    @click="onNewMemberClick"
    @blur="onNewMemberBlur"
    @keyup.enter="onNewMemberEnter"
  >Add Member</h3>
</template>

<script>
export default {
  methods: {
    onNewMemberClick(e) {
      e.target.innerText = "";
    },
    onNewMemberEnter(e) {
      //TODO: add new member to list in server
      let nonDigit = /\D/g;
      let digits = e.target.innerText.replace(nonDigit, "").trim();

      let notValidNumber =
        digits.length < 10 || (digits.length === 11 && digits[0] !== "1");
      if (notValidNumber) {
        e.target.addEventListener(
          "animationend",
          () => e.target.classList.remove("shake"),
          { once: true }
        );
        e.target.classList.add("shake");
        e.target.blur();
        return;
      }
      if (digits.length === 10) digits = "1" + digits;
      this.$emit("numberInput", digits);

      e.target.blur();
    },
    onNewMemberBlur(e) {
      e.target.innerText = "Add Member";
    }
  }
};
</script>

<style lang="scss">
.member-adder {
  margin: 0 10px;
  padding: 15px;
  border-radius: 20px;
  background: var(--dark);
  cursor: pointer;
  color: white;
  background: var(--accent);
  &.shake {
    animation: shake 1s;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0px);
    }
    20%,
    60% {
      transform: translateX(20px);
    }
    40%,
    80% {
      transform: translateX(-20px);
    }
  }
}
</style>