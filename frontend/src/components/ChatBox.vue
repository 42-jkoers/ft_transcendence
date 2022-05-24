<template>
  <div id="chatbox">
    <Card>
      <template v-slot:content>
        <div class="card">
          <div class="flex justify-content-center flex-wrap card-container">
            <InputText
              type="text"
              v-model="input"
              placeholder="Type your message..."
              @keyup.enter="sendMessage"
            >
            </InputText>
            <PrimeVueButton
              @click="sendMessage"
              icon="pi pi-send"
              class="p-button-primary"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import PrimeVueButton from "primevue/button";

//TODO Should input text and button be inside a form tag?
</script>
