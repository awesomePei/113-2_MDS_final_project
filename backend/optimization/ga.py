import numpy as np
import random

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

def create_individual(order_indices):
    ind = order_indices.copy()
    random.shuffle(ind)
    return ind

def crossover(parent1, parent2):
    # Order 1 crossover (OX1)
    size = len(parent1)
    a, b = sorted(random.sample(range(size), 2))
    child = [None]*size
    child[a:b] = parent1[a:b]
    fill = [item for item in parent2 if item not in child]
    pointer = 0
    for i in range(size):
        if child[i] is None:
            child[i] = fill[pointer]
            pointer += 1
    return child

def mutate(individual, mutation_rate=0.3):
    for i in range(len(individual)):
        if random.random() < mutation_rate:
            j = random.randint(0, len(individual)-1)
            individual[i], individual[j] = individual[j], individual[i]
    return individual

def select(population, fitnesses, k=3):
    # Tournament selection
    selected = []
    for _ in range(len(population)):
        aspirants = random.sample(list(zip(population, fitnesses)), k)
        winner = min(aspirants, key=lambda x: x[1])
        selected.append(winner[0])
    return selected

def genetic(orders, population_size=30, generations=30, mutation_rate=0.2, verbose=False):
    order_indices = list(orders.index)
    population = [create_individual(order_indices) for _ in range(population_size)]

    best_individual = None
    best_fitness = float('inf')

    for gen in range(generations):
        fitnesses = [fitness(ind, orders) for ind in population]
        best_idx = np.argmin(fitnesses)
        if fitnesses[best_idx] < best_fitness:
            best_fitness = fitnesses[best_idx]
            best_individual = population[best_idx]
        if verbose:
            print(f"Generation {gen+1}: Best fitness = {fitnesses[best_idx]}")
        selected = select(population, fitnesses)
        next_population = []
        for i in range(0, population_size, 2):
            parent1 = selected[i]
            parent2 = selected[(i+1) % population_size]
            child1 = crossover(parent1, parent2)
            child2 = crossover(parent2, parent1)
            next_population.extend([child1, child2])
        population = [mutate(ind, mutation_rate) for ind in next_population[:population_size]]

    return best_individual, best_fitness