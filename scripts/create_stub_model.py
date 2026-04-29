import numpy as np
import onnx
from onnx import helper, TensorProto

X = helper.make_tensor_value_info("input", TensorProto.FLOAT, [1, 64, 156])
Y = helper.make_tensor_value_info("output", TensorProto.FLOAT, [1, 64, 601])

weights = np.random.randn(156, 601).astype(np.float32) * 0.01
bias = np.zeros(601, dtype=np.float32)

W = helper.make_tensor("W", TensorProto.FLOAT, [156, 601], weights.flatten().tolist())
B = helper.make_tensor("B", TensorProto.FLOAT, [601], bias.tolist())

reshape_shape = helper.make_tensor("reshape_shape", TensorProto.INT64, [2], [-1, 156])
reshape_back = helper.make_tensor("reshape_back", TensorProto.INT64, [3], [1, 64, 601])

reshape_node = helper.make_node("Reshape", ["input", "reshape_shape"], ["flat"])
matmul_node = helper.make_node("MatMul", ["flat", "W"], ["matmul_out"])
add_node = helper.make_node("Add", ["matmul_out", "B"], ["add_out"])
reshape_back_node = helper.make_node("Reshape", ["add_out", "reshape_back"], ["output"])

graph = helper.make_graph(
    [reshape_node, matmul_node, add_node, reshape_back_node],
    "signgloss_stub",
    [X],
    [Y],
    initializer=[W, B, reshape_shape, reshape_back],
)

model = helper.make_model(graph, opset_imports=[helper.make_opsetid("", 13)])
model.ir_version = 7

onnx.checker.check_model(model)
onnx.save(model, "public/models/signgloss_stub.onnx")
print("Saved public/models/signgloss_stub.onnx")
