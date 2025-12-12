import * as TaskManager from 'expo-task-manager';
import api from '../config/api';

export const BACKGROUND_LOCATION_TASK = 'BACKGROUND_LOCATION_TASK';

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
        console.error('Background location task error:', error);
        return;
    }

    if (data) {
        const { locations } = data;

        if (locations && locations.length > 0) {
            const location = locations[0];

            try {
                // Send to backend
                // Note: we don't do reverse geocoding here to save battery/data
                // The backend could do it, or we just rely on lat/long for background
                await api.post('/signals/location', {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    accuracy: location.coords.accuracy,
                    isBackground: true
                });

                // Console logs might not show up in debugger if app is backgrounded detached
                // console.log('Background location sent');
            } catch (err) {
                // Silently fail to avoid annoyance
                // console.error('Background upload failed', err);
            }
        }
    }
});
