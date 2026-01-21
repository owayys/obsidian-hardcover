<script lang="ts">
  export let error: Error
</script>

<div class="hardcover-error">
  <div class="hardcover-error-container">
    <div class="hardcover-error-title">Failed to load books</div>
    <div class="hardcover-error-message">{error.message}</div>
  </div>
</div>