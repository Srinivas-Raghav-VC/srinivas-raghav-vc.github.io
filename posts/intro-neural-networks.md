# An Introduction to Neural Networks

Neural Networks (NNs) are computational models inspired by the structure and function of biological neural networks in animal brains. They form the backbone of many modern **Deep Learning** models.

## The Basic Idea

At its core, a neural network consists of layers of interconnected nodes, often called "neurons".

1.  **Input Layer:** Receives the raw data (e.g., pixel values of an image, words in a sentence).
2.  **Hidden Layers:** One or more layers between the input and output. This is where most of the computation happens. Neurons in these layers transform the input data through weighted connections and activation functions.
3.  **Output Layer:** Produces the final result (e.g., a classification label, a predicted value).

## How Neurons Work (Simplified)

Each neuron receives inputs from the previous layer (or the initial data). It calculates a weighted sum of these inputs, adds a bias term, and then passes this result through an **activation function**.

A common simplified representation is:

$$ \text{output} = f(\sum_{i} (\text{weight}_i \times \text{input}_i) + \text{bias}) $$

Where $f$ is the activation function (like Sigmoid, ReLU, Tanh). This function introduces non-linearity, allowing the network to learn complex patterns.

```python
# Conceptual Python snippet
def simple_neuron(inputs, weights, bias, activation_fn):
  """Calculates the output of a single neuron."""
  weighted_sum = sum(w * i for w, i in zip(weights, inputs)) + bias
  output = activation_fn(weighted_sum)
  return output

# Example activation (ReLU)
def relu(x):
  return max(0, x)