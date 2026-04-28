def predict(features):
    # features = [request_count, time_window]
    count = features[0]

    if count > 10:
        return 1  # attack
    return 0  # safe