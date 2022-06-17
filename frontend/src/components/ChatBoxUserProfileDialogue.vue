<template>
  <Dialog
    :header="clickedUserObject.username"
    :visible="isDialogVisible"
    closeOnEscape
    :closable="true"
    position="center"
  >
    <div class="field p-fluid">
      <Image
        :src="clickedUserObject.avatar"
        width="250"
        heigth="250"
        alt="User Profile"
      />
    </div>
    <template #footer>
      <Button label="Message" icon="pi pi-envelope" @click="sendDM" />
      <Button label="View Profile" icon="pi pi-user" @click="pushToProfile" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from "vue";
import { useRouter } from "vue-router";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Image from "primevue/image"; //TODO style img width

const props = defineProps(["isDialogVisible", "clickedUserObject"]);
console.log(props.clickedUserObject);

const emit = defineEmits(["update:isDialogVisible"]);

const router = useRouter();
const pushToProfile = () => {
  router.push({
    name: "UserProfileCard",
    params: { id: props.clickedUserObject.id },
  });
};

const sendDM = () => {
  //TODO add DM logic
};
</script>
