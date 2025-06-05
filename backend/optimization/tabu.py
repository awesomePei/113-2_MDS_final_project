import numpy as np

def fitness(individual, orders):
    score = 0
    current_time = 0
    for position, idx in enumerate(individual):
        predicted_risk = orders.loc[idx, 'PredictedValue']
        shipping_days = 1

        # 排序越後面，懲罰越高
        delay_penalty = predicted_risk * (position + 1)

        score += delay_penalty
        current_time += shipping_days

    return score

def generate_initial_solution(order_indices):
    initial = order_indices.copy()
    np.random.shuffle(initial)
    return initial

def generate_neighbors(solution, neighbor_size=30):
    neighbors = []
    for _ in range(neighbor_size):
        neighbor = solution.copy()
        i, j = np.random.choice(len(neighbor), 2, replace=False)
        neighbor[i], neighbor[j] = neighbor[j], neighbor[i]
        neighbors.append(neighbor)
    return neighbors

def tabu_search(orders, order_indices, max_iter=100, tabu_size=20, neighbor_size=30):
    best_solution = generate_initial_solution(order_indices)
    best_fitness = fitness(best_solution, orders)
    current_solution = best_solution.copy()
    tabu_list = []

    for _ in range(max_iter):
        neighbors = generate_neighbors(current_solution, neighbor_size)
        candidate = None
        candidate_fitness = None
        for neighbor in neighbors:
            if neighbor not in tabu_list:
                f = fitness(neighbor, orders)
                if candidate is None or f < candidate_fitness:
                    candidate = neighbor
                    candidate_fitness = f

        if candidate is None:
            break

        current_solution = candidate
        if candidate_fitness < best_fitness:
            best_solution = candidate
            best_fitness = candidate_fitness

        tabu_list.append(candidate)
        if len(tabu_list) > tabu_size:
            tabu_list.pop(0)

    return best_solution, best_fitness