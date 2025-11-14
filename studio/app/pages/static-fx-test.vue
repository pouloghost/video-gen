<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Static FX Test</h1>

    <form @submit.prevent="applyEffect" class="mb-4">
      <div class="mb-4">
        <label class="block mb-2">Target Image Path:</label>
        <input v-model="form.target_image" type="text" class="border p-2 w-full"
          placeholder="Enter absolute path to image" />
      </div>

      <div class="mb-4">
        <label class="block mb-2">Duration (seconds):</label>
        <input v-model.number="form.duration" type="number" class="border p-2 w-full" min="1" />
      </div>

      <div class="mb-4">
        <label class="block mb-2">Coordinates (top, left, bottom, right):</label>
        <div class="grid grid-cols-4 gap-2">
          <input v-model.number="form.coordinate[0]" type="number" class="border p-2" min="0" max="1" step="0.01"
            placeholder="top" />
          <input v-model.number="form.coordinate[1]" type="number" class="border p-2" min="0" max="1" step="0.01"
            placeholder="left" />
          <input v-model.number="form.coordinate[2]" type="number" class="border p-2" min="0" max="1" step="0.01"
            placeholder="bottom" />
          <input v-model.number="form.coordinate[3]" type="number" class="border p-2" min="0" max="1" step="0.01"
            placeholder="right" />
        </div>
      </div>

      <div class="mb-4">
        <label class="block mb-2">Effect:</label>
        <select v-model="form.fx" class="border p-2 w-full">
          <option value="slow_zoom_in">slow_zoom_in</option>
        </select>
      </div>

      <button type="submit" class="bg-blue-500 text-white p-2 rounded">Apply Effect</button>
    </form>

    <div v-if="result" class="mt-4">
      <h2 class="text-xl font-bold mb-2">Result:</h2>
      <p v-if="result.success && result.video_path" class="text-green-500">Success! Video path: {{ result.video_path }}
      </p>
      <p v-else-if="result.error" class="text-red-500">Failed: {{ result.error }}</p>
      <p v-else class="text-red-500">Failed to apply effect</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface StaticFxResult {
  success: boolean;
  video_path?: string;
  error?: string;
}

const form = ref({
  target_image: '',
  duration: 5,
  coordinate: [0.0, 0.0, 1.0, 1.0],
  fx: 'slow_zoom_in'
});

const result = ref<StaticFxResult | null>(null);

async function applyEffect() {
  try {
    const response = await fetch('/api/video/static-fx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    });

    result.value = await response.json();
  } catch (error) {
    console.error('Error applying effect:', error);
    result.value = { success: false };
  }
}
</script>